import {
  GetCommand,
  UpdateCommand,
  QueryCommand,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { db } from "../config/dynamo.js";
import { config } from "../config/env.js";
import { schedulePollCreation } from "./eventbridge.service.js";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const TABLE = config.dynamoTable;
const lambdaClient = new LambdaClient({
  region: config.awsRegion,
});

export async function createMatchService({
  teams,
  startTime,
}: {
  teams: string[];
  startTime: string;
}) {
  const matchId = `match-${randomUUID()}`;

  const item = {
    PK: `MATCH#${matchId}`,
    SK: `MATCH#${matchId}`,
    entity: "Match",
    teams,
    startTime,
    winner: null,
    createdAt: new Date().toISOString(),
  };

  await db.send(
    new PutCommand({
      TableName: TABLE,
      Item: item,
    })
  );

  const matchStart = new Date(startTime);
  const pollTime = new Date(matchStart.getTime() - 30 * 60 * 1000);

  if (pollTime.getTime() <= Date.now()) {
    throw new Error(
      `Poll time ${pollTime.toISOString()} must be in the future`
    );
  }

  await schedulePollCreation({
    matchId,
    pollTime,
    lambdaArn: config.createPollLambdaArn,
  });

  return {
    matchId,
    teams,
    startTime,
    winner: null,
  };
}

export async function setMatchWinnerService(matchId: string, winner: string) {
  // Fetch match
  const matchResult = await db.send(
    new GetCommand({
      TableName: TABLE,
      Key: {
        PK: `MATCH#${matchId}`,
        SK: `MATCH#${matchId}`,
      },
    })
  );

  if (!matchResult.Item) {
    throw new Error("Match not found");
  }

  const match = matchResult.Item as any;

  if (!match.teams.includes(winner)) {
    throw new Error("Winner must be one of the match teams");
  }

  // Update winner
  await db.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: {
        PK: `MATCH#${matchId}`,
        SK: `MATCH#${matchId}`,
      },
      UpdateExpression: "SET winner = :winner",
      ExpressionAttributeValues: {
        ":winner": winner,
      },
    })
  );

  await lambdaClient.send(
    new InvokeCommand({
      FunctionName: config.awardPointsLambdaName,
      InvocationType: "Event", // async
      Payload: Buffer.from(
        JSON.stringify({
          matchId,
        })
      ),
    })
  );

  return {
    matchId,
    winner,
  };
}

export async function awardPointsService(matchId: string) {
  // 1. Fetch match
  const matchResult = await db.send(
    new GetCommand({
      TableName: TABLE,
      Key: {
        PK: `MATCH#${matchId}`,
        SK: `MATCH#${matchId}`,
      },
    })
  );

  if (!matchResult.Item) {
    throw new Error("Match not found");
  }

  const match = matchResult.Item as any;

  if (!match.winner) {
    throw new Error("Match winner not set");
  }

  if (match.pointsAwarded) {
    throw new Error("Points already awarded for this match");
  }

  // 2. Scan table to find poll for this match (MVP-safe)
  const scanResult = await db.send(
    new ScanCommand({
      TableName: TABLE,
      FilterExpression: "entity = :poll AND matchId = :matchId",
      ExpressionAttributeValues: {
        ":poll": "Poll",
        ":matchId": matchId,
      },
    })
  );

  const poll = scanResult.Items?.[0];

  if (!poll) {
    throw new Error("Poll not found for this match");
  }

  // 3. Fetch votes for poll
  const voteResult = await db.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: {
        ":pk": `VOTE#${poll.pollId}`,
      },
    })
  );

  const votes = voteResult.Items || [];

  // 4. Award points
  let winnersCount = 0;

  for (const vote of votes) {
    if (vote.team === match.winner) {
      await db.send(
        new UpdateCommand({
          TableName: TABLE,
          Key: {
            PK: `USER#${vote.userId}`,
            SK: `USER#${vote.userId}`,
          },
          UpdateExpression: "SET points = if_not_exists(points, :zero) + :inc",
          ExpressionAttributeValues: {
            ":inc": 1,
            ":zero": 0,
          },
        })
      );
      winnersCount++;
    }
  }

  // 5. Mark match as points awarded
  await db.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: {
        PK: `MATCH#${matchId}`,
        SK: `MATCH#${matchId}`,
      },
      UpdateExpression: "SET pointsAwarded = :true",
      ExpressionAttributeValues: {
        ":true": true,
      },
    })
  );

  return {
    matchId,
    winner: match.winner,
    totalVotes: votes.length,
    winnersAwarded: winnersCount,
  };
}

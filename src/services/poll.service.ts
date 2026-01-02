import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { db } from "../config/dynamo.js";
import { config } from "../config/env.js";

const TABLE = config.dynamoTable;

export async function createPollService(matchId: string) {
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

  // 2. Calculate poll window
  const matchStart = new Date(match.startTime);
  const openAt = new Date(matchStart.getTime() - 30 * 60 * 1000); // minus 30 mins
  const closeAt = matchStart;

  // 3. Create poll item
  const pollId = `poll-${randomUUID()}`;

  const pollItem = {
    PK: `POLL#${pollId}`,
    SK: `POLL#${pollId}`,
    entity: "Poll",
    pollId,
    matchId,
    options: match.teams,
    openAt: openAt.toISOString(),
    closeAt: closeAt.toISOString(),
    createdAt: new Date().toISOString(),
  };

  await db.send(
    new PutCommand({
      TableName: TABLE,
      Item: pollItem,
    })
  );

  return {
    pollId,
    matchId,
    options: match.teams,
    openAt: pollItem.openAt,
    closeAt: pollItem.closeAt,
  };
}

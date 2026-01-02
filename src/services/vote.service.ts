import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "../config/dynamo.js";
import { config } from "../config/env.js";

const TABLE = config.dynamoTable;

export async function voteService({
  pollId,
  userId,
  team,
}: {
  pollId: string;
  userId: string;
  team: string;
}) {
  // 1. Fetch poll
  const pollResult = await db.send(
    new GetCommand({
      TableName: TABLE,
      Key: {
        PK: `POLL#${pollId}`,
        SK: `POLL#${pollId}`,
      },
    })
  );

  if (!pollResult.Item) {
    throw new Error("Poll not found");
  }

  const poll = pollResult.Item as any;

  // 2. Validate poll timing
  const now = new Date();
  const openAt = new Date(poll.openAt);
  const closeAt = new Date(poll.closeAt);

  if (now < openAt) {
    throw new Error("Poll has not opened yet");
  }

  if (now >= closeAt) {
    throw new Error("Poll is closed");
  }

  // 3. Validate team option
  if (!poll.options.includes(team)) {
    throw new Error("Invalid team option");
  }

  // 4. Write vote (prevent duplicates)
  const voteItem = {
    PK: `VOTE#${pollId}`,
    SK: `USER#${userId}`,
    entity: "Vote",
    pollId,
    userId,
    team,
    createdAt: new Date().toISOString(),
  };

  await db.send(
    new PutCommand({
      TableName: TABLE,
      Item: voteItem,
      ConditionExpression: "attribute_not_exists(PK)",
    })
  );
}

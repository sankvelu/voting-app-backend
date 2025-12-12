import { db } from "../config/dynamo.js";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { config } from "../config/env.js";

const TABLE = config.dynamoTable;

interface UserInput {
  email: string;
  displayName: string;
  password: string;
}

interface User extends UserInput {
  id: string;
  PK: string;
  SK: string;
  createdAt: string;
}

export const createUser = async (user: UserInput): Promise<User> => {
  const id = randomUUID();

  const item = {
    PK: `USER#${id}`,
    SK: `USER#${id}`,
    id,
    email: user.email,
    displayName: user.displayName,
    password: user.password,
    createdAt: new Date().toISOString(),
  };

  await db.send(
    new PutCommand({
      TableName: TABLE,
      Item: item,
    })
  );

  return item;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const result = await db.send(
    new GetCommand({
      TableName: TABLE,
      Key: {
        PK: `EMAIL#${email}`,
        SK: `EMAIL#${email}`,
      },
    })
  );

  return (result.Item as User) || null;
};

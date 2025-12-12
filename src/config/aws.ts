import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { config } from "./env.js";

export const dynamoClient = new DynamoDBClient({
  region: config.awsRegion,
});

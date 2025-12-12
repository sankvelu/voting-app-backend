import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "./aws.js";

export const db = DynamoDBDocumentClient.from(dynamoClient);

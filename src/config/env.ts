import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET,
  awsRegion: process.env.AWS_REGION || "eu-north-1",
  dynamoTable: process.env.DYNAMODB_TABLE || "voting-app-v1.0",
};

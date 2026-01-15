import {
  EventBridgeClient,
  PutRuleCommand,
  PutTargetsCommand,
} from "@aws-sdk/client-eventbridge";
import { config } from "../config/env.js";

const ebClient = new EventBridgeClient({
  region: config.awsRegion,
});

export async function schedulePollCreation({
  matchId,
  pollTime,
  lambdaArn,
}: {
  matchId: string;
  pollTime: Date;
  lambdaArn: string;
}) {
  const ruleName = `poll-create-${matchId}`;

  /*
  function toEventBridgeAt(date: Date): string {
    return date.toISOString().replace(/\.\d{3}Z$/, "Z");
  } */

  function toEventBridgeCron(date: Date): string {
    const d = new Date(date);
  
    const minute = d.getUTCMinutes();
    const hour = d.getUTCHours();
    const day = d.getUTCDate();
    const month = d.getUTCMonth() + 1; // 1-based
    const year = d.getUTCFullYear();
  
    return `cron(${minute} ${hour} ${day} ${month} ? ${year})`;
  }
  

  // EventBridge requires UTC "Z" time
  // const scheduleExpression = `at(${toEventBridgeAt(pollTime)})`;
  // console.log(scheduleExpression)

  const cronExpression = toEventBridgeCron(pollTime);
  console.log("EventBridge cron:", cronExpression);

  // 1. Create rule
  await ebClient.send(
    new PutRuleCommand({
      Name: ruleName,
      ScheduleExpression: cronExpression,
      State: "ENABLED",
    })
  );

  // 2. Attach Lambda target
  await ebClient.send(
    new PutTargetsCommand({
      Rule: ruleName,
      Targets: [
        {
          Id: "CreatePollLambdaTarget",
          Arn: lambdaArn,

          Input: JSON.stringify({ matchId }),
        },
      ],
    })
  );

  return {
    ruleName,
    scheduledAt: pollTime.toISOString(),
  };
}

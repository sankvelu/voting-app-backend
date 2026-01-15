import { handler } from "./createPoll.lambda.js";

(async () => {
  const response = await handler({
    matchId: "match-abc123",
  });

  console.log(response);
})();

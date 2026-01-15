import { createPollService } from "./src/services/poll.service.js";

export const handler = async (event: { matchId?: string }) => {
  try {
    if (!event.matchId) {
      throw new Error("matchId is required");
    }

    const poll = await createPollService(event.matchId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Poll created successfully",
        poll,
      }),
    };
  } catch (error: any) {
    console.error("Lambda error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
      }),
    };
  }
};

import { createPollService } from "../services/poll.service.js";

interface EventInput {
  matchId: string;
}

export const handler = async (event: EventInput) => {
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
    console.error("Poll creation failed:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
      }),
    };
  }
};

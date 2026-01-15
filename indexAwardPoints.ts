import { awardPointsService } from "./src/services/match.service.js";

export const handler = async (event: { matchId?: string }) => {
  try {
    if (!event.matchId) {
      throw new Error("matchId is required");
    }

    const result = await awardPointsService(event.matchId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Points awarded successfully",
        result,
      }),
    };
  } catch (error: any) {
    console.error("Award points error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
      }),
    };
  }
};

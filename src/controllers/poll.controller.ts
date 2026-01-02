import type { Request, Response, NextFunction } from "express";
import { createPollService } from "../services/poll.service.js";

export async function createPoll(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { matchId } = req.body;

    if (!matchId) {
      return res.status(400).json({
        error: "matchId is required",
      });
    }

    const poll = await createPollService(matchId);

    res.status(201).json(poll);
  } catch (err) {
    next(err);
  }
}

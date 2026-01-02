import type { Request, Response, NextFunction } from "express";
import { voteService } from "../services/vote.service.js";

export async function voteInPoll(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { pollId } = req.params;
    const { userId, team } = req.body;

    if (!userId || !team) {
      return res.status(400).json({
        error: "userId and team are required",
      });
    }

    await voteService({
      pollId,
      userId,
      team,
    });

    res.status(201).json({
      message: "Vote recorded successfully",
    });
  } catch (err: any) {
    res.status(400).json({
      error: err.message,
    });
  }
}

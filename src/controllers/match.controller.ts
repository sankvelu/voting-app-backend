import type { Request, Response, NextFunction } from "express";
import {
  createMatchService,
  setMatchWinnerService,
  awardPointsService,
} from "../services/match.service.js";

export async function createMatch(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { teams, startTime } = req.body;

    if (!teams || teams.length !== 2) {
      return res.status(400).json({
        error: "Exactly two teams are required",
      });
    }

    if (!startTime) {
      return res.status(400).json({
        error: "startTime is required",
      });
    }

    const match = await createMatchService({
      teams,
      startTime,
    });

    res.status(201).json(match);
  } catch (err) {
    next(err);
  }
}

export async function updateMatchWinner(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { matchId } = req.params;
    const { winner } = req.body;

    if (!winner) {
      return res.status(400).json({ error: "winner is required" });
    }

    const result = await setMatchWinnerService(matchId, winner);

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function awardPoints(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { matchId } = req.params;

    const result = await awardPointsService(matchId);

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

import { Router } from "express";
import {
  createMatch,
  updateMatchWinner,
  awardPoints,
} from "../controllers/match.controller.js";

export const matchRouter = Router();

matchRouter.post("/", createMatch);
matchRouter.put("/:matchId/winner", updateMatchWinner);
matchRouter.post("/:matchId/award-points", awardPoints);

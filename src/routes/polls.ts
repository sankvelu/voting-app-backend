import { Router } from "express";
import { createPoll } from "../controllers/poll.controller.js";
import { voteInPoll } from "../controllers/vote.controller.js";

export const pollRouter = Router();

pollRouter.post("/", createPoll);
pollRouter.post("/:pollId/vote", voteInPoll);

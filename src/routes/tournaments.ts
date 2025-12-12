import express from "express";

const tournamentRouter = express.Router();

// minimal placeholder route
tournamentRouter.get("/", (req, res) => {
  res.json({ message: "tournaments root" });
});

export { tournamentRouter };

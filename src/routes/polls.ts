import express from "express";

const pollRouter = express.Router();

// minimal placeholder route
pollRouter.get("/", (req, res) => {
  res.json({ message: "poll root" });
});

export { pollRouter };

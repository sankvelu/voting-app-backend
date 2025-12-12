import express from "express";
import cors from "cors";

import { authRouter } from "./routes/auth.js";
import { tournamentRouter } from "./routes/tournaments.js";
import { pollRouter } from "./routes/polls.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "The server for Voting app is UP!" });
});

app.use("/auth", authRouter);
app.use("/tournaments", tournamentRouter);
app.use("/polls", pollRouter);

export default app;

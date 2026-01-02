import express from "express";
import cors from "cors";

import { authRouter } from "./routes/auth.js";
import { tournamentRouter } from "./routes/tournaments.js";
import { pollRouter } from "./routes/polls.js";
import { matchRouter } from "./routes/matches.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "The server for Voting app is UP!" });
});

app.use("/auth", authRouter);
app.use("/tournaments", tournamentRouter);
app.use("/polls", pollRouter);
app.use("/admin/polls", pollRouter);
app.use("/admin/matches", matchRouter);

export default app;

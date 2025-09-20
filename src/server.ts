import express from "express";
import { authRouter } from "./routes/auth.ts";
import { habitsRouter } from "./routes/habits.ts";
import { usersRouter } from "./routes/users.ts";

export const app = express();

// Health check endpoint
app.get("/health", (_req, res) => {
	res.status(200).json({
		status: "OK",
		timestamp: new Date().toISOString(),
		service: "Habit Trackr API",
	});
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/habits", habitsRouter);
app.use("/api/users", usersRouter);

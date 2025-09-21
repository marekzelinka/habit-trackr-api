import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env, isTestEnv } from "../env.ts";
import { authRouter } from "./routes/auth.ts";
import { habitsRouter } from "./routes/habits.ts";
import { usersRouter } from "./routes/users.ts";

export const app = express();

app.use(helmet());
app.use(
	cors({
		origin: env.CORS_ORIGIN,
		credentials: true,
	}),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev", { skip: () => isTestEnv() }));

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

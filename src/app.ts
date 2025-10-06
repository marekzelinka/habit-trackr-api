import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env, isTestEnv } from "../env.ts";
import { errorHandler, notFound } from "./middleware/error-hanlder.ts";
import { authRouter } from "./routes/auth.ts";
import { habitsRouter } from "./routes/habits.ts";
import { healthRouter } from "./routes/health.ts";
import { tagsRouter } from "./routes/tags.ts";
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
app.use("/health", healthRouter);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/habits", habitsRouter);
app.use("/api/tags", tagsRouter);

app.use(notFound);

app.use(errorHandler);

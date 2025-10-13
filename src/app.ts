import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";
import { secureHeaders } from "hono/secure-headers";
import { env, isTestEnv } from "../env.ts";
import { errorHandler, notFoundHandler } from "./middleware/error-hanlder.ts";
import { authRouter } from "./routes/auth.ts";
import { healthcheckRouter } from "./routes/healthcheck.ts";
import { usersRouter } from "./routes/users.ts";

export const app = new Hono();

app.use(poweredBy());
app.use(secureHeaders());
app.use("*", cors({ origin: env.CORS_ORIGIN, credentials: true }));

if (!isTestEnv()) {
	app.use(logger());
}

// Health check endpoint
app.route("/health", healthcheckRouter);

// API Routes
app.basePath("/api").route("/auth", authRouter).route("/users", usersRouter);
// app.use("/api/auth", authRouter);
// app.use("/api/users", usersRouter);
// app.use("/api/habits", habitsRouter);
// app.use("/api/tags", tagsRouter);

app.notFound(notFoundHandler);
app.onError(errorHandler);

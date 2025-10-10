import { createEnv } from "@t3-oss/env-core";
// @ts-expect-error
import { env as loadEnv } from "custom-env";
import * as z from "zod";

process.env.APP_STAGE = process.env.APP_STAGE || "dev";

const isProduction = process.env.APP_STAGE === "production";
const isDevelopment = process.env.APP_STAGE === "dev";
const isTest = process.env.APP_STAGE === "test";

if (isDevelopment) {
	loadEnv();
} else if (isTest) {
	loadEnv("test");
}

export const env = createEnv({
	server: {
		// Node environment
		NODE_ENV: z
			.enum(["development", "production", "test"], {
				error: "NODE_ENV must be development, production, or test",
			})
			.default("development"),

		APP_STAGE: z
			.enum(["dev", "production", "test"], {
				error: "APP_STAGE must be dev, production, or test",
			})
			.default("dev"),

		// Server
		PORT: z.coerce
			.number({ error: "PORT must be a number" })
			.positive({ error: "PORT must be greater than 0" })
			.max(65536, { error: "PORT must be less than 65536" })
			.default(3000),
		HOST: z.string({ error: "Host must be a string" }).default("localhost"),

		// Database
		DATABASE_URL: z.url({
			protocol: /^postgresql$/,
			error: "Invalid DATABASE_URL format",
		}),
		DATABASE_POOL_MIN: z.coerce
			.number({ error: "DATABASE_POOL_MIN must be a number" })
			.min(0, { error: "DATABASE_POOL_MIN must be 0 or greater" })
			.default(2),
		DATABASE_POOL_MAX: z.coerce
			.number({ error: "DATABASE_POOL_MAX must be a number" })
			.positive({ error: "DATABASE_POOL_MAX must be 0 or greater" })
			.default(10),

		// JWT & Auth
		JWT_SECRET: z
			.string({ error: "JWT_SECRET must be a string" })
			.min(32, "JWT_SECRET must be at least 32 characters"),
		JWT_EXPIRES_IN: z
			.string({ error: "JWT_EXPIRES_IN must be a string" })
			.default("7d"),
		REFRESH_TOKEN_SECRET: z
			.string({ error: "REFRESH_TOKEN_SECRET must be a string" })
			.min(32, { error: "REFRESH_TOKEN_SECRET must be 32 or more character" })
			.optional(),
		REFRESH_TOKEN_EXPIRES_IN: z
			.string({ error: "REFRESH_TOKEN_EXPIRES_IN must be a string" })
			.default("30d"),

		// Security
		BCRYPT_ROUNDS: z.coerce
			.number({ error: "BCRYPT_ROUNDS must be a string" })
			.min(10, { error: "BCRYPT_ROUNDS must be 10 or greater" })
			.max(20, { error: "BCRYPT_ROUNDS must be 20 or less" })
			.default(12),

		// CORS
		CORS_ORIGIN: z
			.string()
			.or(z.array(z.string()))
			.transform((val) => {
				if (typeof val === "string") {
					return val.split(",").map((origin) => origin.trim());
				}

				return val;
			})
			.default([]),

		// Logging
		LOG_LEVEL: z
			.enum(["error", "warn", "info", "debug", "trace"], {
				error: "LOG_LEVEL must be error, warn, info, debug, or trace",
			})
			.default(isProduction ? "info" : "debug"),
	},
	runtimeEnv: process.env,
});

export const isProdEnv = () => env.NODE_ENV === "production";
export const isDevEnv = () => env.NODE_ENV === "development";
export const isTestEnv = () => env.NODE_ENV === "test";

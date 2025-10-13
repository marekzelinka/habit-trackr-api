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
			.enum(["development", "production", "test"])
			.default("development"),

		APP_STAGE: z.enum(["dev", "production", "test"]).default("dev"),

		// Server
		PORT: z.coerce.number().positive().max(65536).default(3000),
		HOST: z.string().default("localhost"),

		// Database
		DATABASE_URL: z.url({
			protocol: /^postgresql$/,
		}),
		DATABASE_POOL_MIN: z.coerce.number().min(0).default(2),
		DATABASE_POOL_MAX: z.coerce.number().positive().default(10),

		// JWT & Auth
		JWT_SECRET: z.string().min(32),
		JWT_EXPIRES_IN: z.coerce.number().default(20),
		REFRESH_TOKEN_SECRET: z.string().min(32).optional(),
		REFRESH_TOKEN_EXPIRES_IN: z.string().default("30d"),

		// Security
		BCRYPT_ROUNDS: z.coerce.number().min(10).max(20).default(12),

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
			.enum(["error", "warn", "info", "debug", "trace"])
			.default(isProduction ? "info" : "debug"),
	},
	runtimeEnv: process.env,
});

export const isProdEnv = () => env.NODE_ENV === "production";
export const isDevEnv = () => env.NODE_ENV === "development";
export const isTestEnv = () => env.NODE_ENV === "test";

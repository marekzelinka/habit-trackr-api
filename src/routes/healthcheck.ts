import { sql } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { db } from "../db/connection.ts";
import type { SuccessResponse } from "../types.ts";

export const healthcheckRouter = new Hono()
	.get("/", (c) => {
		return c.json<
			SuccessResponse<{ status: "OK"; timestamp: string; service: string }>
		>({
			success: true,
			data: {
				status: "OK",
				timestamp: new Date().toISOString(),
				service: "Habit Tracker API",
			},
		});
	})
	.get("/detailed", async (c) => {
		try {
			// Check database connection
			await db.execute(sql`SELECT 1`);

			return c.json<
				SuccessResponse<{
					status: "OK";
					timestamp: string;
					services: { database: string };
					uptime: number;
				}>
			>({
				success: true,
				data: {
					status: "OK",
					timestamp: new Date().toISOString(),
					services: {
						database: "connected",
					},
					uptime: process.uptime(),
				},
			});
		} catch (error) {
			throw new HTTPException(503, {
				message: "Service unhealthy",
				cause: error instanceof Error ? error.message : "Unknown Error",
			});
		}
	});

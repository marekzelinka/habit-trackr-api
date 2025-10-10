import { sql } from "drizzle-orm";
import express from "express";
import { db } from "../db/connection.ts";

export const healthRouter = express.Router();

healthRouter.get("/", (_req, res) => {
	res.json({
		success: true,
		data: {
			status: "OK",
			timestamp: new Date().toISOString(),
			service: "Habit Tracker API",
		},
	});
});

healthRouter.get("/detailed", async (_req, res) => {
	try {
		// Check database connection
		await db.execute(sql`SELECT 1`);

		res.status(200).json({
			success: true,
			data: {
				status: "OK",
				timestamp: new Date().toISOString(),
				services: {
					database: "connected",
				},
				version: process.env.APP_VERSION,
				uptime: process.uptime(),
			},
		});
	} catch (error) {
		res.status(503).json({
			status: "ERROR",
			message: "Service unhealthy",
			error: error instanceof Error ? error.message : "Unknown Error",
		});
	}
});

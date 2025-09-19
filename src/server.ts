import express from "express";

export const app = express();

// Health check endpoint
app.get("/health", (_req, res) => {
	res.status(200).json({
		status: "OK",
		timestamp: new Date().toISOString(),
		service: "Habit Trackr API",
	});
});

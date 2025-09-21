import express from "express";

export const habitsRouter = express.Router();

habitsRouter.get("/", (_req, res) => {
	res.json({ message: "habit" });
});

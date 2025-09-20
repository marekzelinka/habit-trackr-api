import { Router } from "express";

export const habitsRouter = Router();

habitsRouter.get("/", (_req, res) => {
	res.json({ message: "habit" });
});

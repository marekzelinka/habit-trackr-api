import express from "express";
import { authenticate } from "../middleware/auth.ts";

export const habitsRouter = express.Router();

habitsRouter.use(authenticate);

habitsRouter.get("/", (_req, res) => {
	res.json({ message: "habit" });
});

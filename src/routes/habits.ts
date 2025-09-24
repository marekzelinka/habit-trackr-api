import express from "express";
import type { WeakRequestHandler } from "express-zod-safe";
import { authenticate } from "../middleware/auth.ts";

export const habitsRouter = express.Router();

const auth = authenticate as WeakRequestHandler;
habitsRouter.use(auth);

habitsRouter.get("/", (_req, res) => {
	res.json({ message: "habit" });
});

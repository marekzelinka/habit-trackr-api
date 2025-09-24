import express from "express";
import type { WeakRequestHandler } from "express-zod-safe";
import { authenticate } from "../middleware/auth.ts";

export const usersRouter = express.Router();

const auth = authenticate as WeakRequestHandler;

usersRouter.use(auth);

usersRouter.get("/", (_req, res) => {
	res.json({ message: "user" });
});

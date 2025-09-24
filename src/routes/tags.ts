import express from "express";
import type { WeakRequestHandler } from "express-zod-safe";
import { authenticate } from "../middleware/auth.ts";

export const tagsRouter = express.Router();

const auth = authenticate as WeakRequestHandler;

tagsRouter.use(auth);

tagsRouter.get("/", (_req, res) => {
	res.json({ message: "tag" });
});

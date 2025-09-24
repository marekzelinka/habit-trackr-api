import express from "express";
import { authenticate } from "../middleware/auth.ts";

export const tagsRouter = express.Router();

tagsRouter.use(authenticate);

tagsRouter.get("/", (_req, res) => {
	res.json({ message: "tag" });
});

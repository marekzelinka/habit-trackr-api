import { Router } from "express";

export const tagsRouter = Router();

tagsRouter.get("/", (_req, res) => {
	res.json({ message: "tag" });
});

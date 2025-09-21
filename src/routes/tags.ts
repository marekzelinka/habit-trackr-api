import express from "express";

export const tagsRouter = express.Router();

tagsRouter.get("/", (_req, res) => {
	res.json({ message: "tag" });
});

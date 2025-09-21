import express from "express";

export const usersRouter = express.Router();

usersRouter.get("/", (_req, res) => {
	res.json({ message: "user" });
});

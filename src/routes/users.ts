import { Router } from "express";

export const usersRouter = Router();

usersRouter.get("/", (_req, res) => {
	res.json({ message: "user" });
});

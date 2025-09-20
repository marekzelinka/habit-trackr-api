import { Router } from "express";

export const authRouter = Router();

authRouter.post("/auth", (_req, res) => {
	res.json({ message: "auth" });
});

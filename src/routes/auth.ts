import express from "express";

export const authRouter = express.Router();

authRouter.post("/auth", (_req, res) => {
	res.json({ message: "auth" });
});

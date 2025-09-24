import type { Request, RequestHandler } from "express";
import { type JWTPayload, verifyToken } from "../utils/jwt.ts";

export interface RequestWithUser extends Request {
	user?: JWTPayload;
}

export const authenticate: RequestHandler = async (req, res, next) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			res.status(401).json({ error: "Access token required" });

			return;
		}

		const payload = await verifyToken(token);
		console.log("token", token);

		(req as RequestWithUser).user = payload;

		next();
	} catch {
		res.status(403).json({ error: "Invalid or expired token" });
	}
};

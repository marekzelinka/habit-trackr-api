import type { Request } from "express";
import type { WeakRequestHandler } from "express-zod-safe";
import { type JWTPayload, verifyToken } from "../utils/jwt.ts";

export interface RequestWithUser extends Request {
	user?: JWTPayload;
}

// biome-ignore lint/suspicious/noExplicitAny: This is tricky, we don't want to enforce specific types for the request fields, because we need this to be as generic as possible, so that we can type assert the request with a user property
export function getUserIdFromRequest(req: Request<any, any, any, any>) {
	// User is guaranteed to exist after auth middleware
	const userId = (req as RequestWithUser).user?.id as string;

	return userId;
}

export const authenticate: WeakRequestHandler = async (req, res, next) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			res.status(401).json({ error: "Access token required" });

			return;
		}

		const payload = await verifyToken(token);

		(req as RequestWithUser).user = payload;

		next();
	} catch {
		res.status(403).json({ error: "Invalid or expired token" });
	}
};

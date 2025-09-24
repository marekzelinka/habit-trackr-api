import { eq } from "drizzle-orm";
import express from "express";
import type { WeakRequestHandler } from "express-zod-safe";
import { db } from "../db/connection.ts";
import { users } from "../db/schema.ts";
import { authenticate, type RequestWithUser } from "../middleware/auth.ts";

export const usersRouter = express.Router();

const auth = authenticate as WeakRequestHandler;
usersRouter.use(auth);

usersRouter.get("/profile", async (req: RequestWithUser, res) => {
	try {
		const userId = req.user?.id as string;

		const [user] = await db
			.select({
				id: users.id,
				email: users.email,
				username: users.username,
				firstName: users.firstName,
				lastName: users.lastName,
				createdAt: users.createdAt,
				updatedAt: users.updatedAt,
			})
			.from(users)
			.where(eq(users.id, userId));

		if (!user) {
			res.status(404).json({ success: false, error: "User not found" });
			return;
		}

		res.json({ success: true, message: "Profile retrived", data: { user } });
	} catch (error) {
		console.error("Get profile error:", error);

		res.status(500).json({ success: false, error: "Failed to fetch profile" });
	}
});

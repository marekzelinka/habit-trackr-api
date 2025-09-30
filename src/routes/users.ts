import { eq } from "drizzle-orm";
import express from "express";
import validate from "express-zod-safe";
import z from "zod";
import { db } from "../db/connection.ts";
import { UpdateUserSchema, users } from "../db/schema.ts";
import { authenticate, getUserIdFromRequest } from "../middleware/auth.ts";
import { comparePassword, hashPassword } from "../utils/password.ts";

export const usersRouter = express.Router();

usersRouter.use(authenticate);

usersRouter.get("/profile", async function getUserProfile(req, res) {
	const userId = getUserIdFromRequest(req);

	try {
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

const UpdateProfileSchema = UpdateUserSchema.extend({
	email: z.email("Invalid email format").optional(),
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(50, "Username too long")
		.optional(),
	firstName: z.string().max(50, "First name too long").optional(),
	lastName: z.string().max(50, "Last name too long").optional(),
});

usersRouter.put(
	"/profile",
	validate({ body: UpdateProfileSchema }),
	async function updateUserProfile(req, res) {
		const userId = getUserIdFromRequest(req);

		const { email, username, firstName, lastName } = req.body;

		try {
			const [updatedUser] = await db
				.update(users)
				.set({
					email,
					username,
					firstName,
					lastName,
					updatedAt: new Date(),
				})
				.where(eq(users.id, userId))
				.returning({
					id: users.id,
					email: users.email,
					username: users.username,
					firstName: users.firstName,
					lastName: users.lastName,
					updatedAt: users.updatedAt,
				});

			res.json({
				success: true,
				message: "Profile update successful",
				data: { user: updatedUser },
			});
		} catch (error) {
			console.error("Update profile error:", error);

			res
				.status(500)
				.json({ success: false, error: "Failed to update profile" });
		}
	},
);

const UpdatePasswordSchema = z.object({
	currentPassword: z.string().min(1, "Current password is required"),
	newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

usersRouter.put(
	"/password",
	validate({ body: UpdatePasswordSchema }),
	async function updateUserPassword(req, res) {
		const userId = getUserIdFromRequest(req);

		const { currentPassword, newPassword } = req.body;

		try {
			// Get logged-in user with current password
			const [loggedInUser] = await db
				.select({
					password: users.password,
				})
				.from(users)
				.where(eq(users.id, userId));

			if (!loggedInUser) {
				res.status(404).json({ success: false, error: "User not found" });

				return;
			}

			const isCurrentPasswordValid = await comparePassword(
				currentPassword,
				loggedInUser.password,
			);

			if (!isCurrentPasswordValid) {
				res
					.status(400)
					.json({ success: false, error: "Current password is incorrect" });

				return;
			}

			const hashedPassword = await hashPassword(newPassword);

			// Update current password with new password (hashed)
			await db
				.update(users)
				.set({ password: hashedPassword, updatedAt: new Date() })
				.where(eq(users.id, userId));

			res.json({
				success: true,
				message: "Password update successful",
			});
		} catch (error) {
			console.error("Update password error:", error);

			res
				.status(500)
				.json({ success: false, error: "Failed to update password" });
		}
	},
);

import express from "express";
import validate from "express-zod-safe";
import z from "zod";
import { db } from "../db/connection.ts";
import { InsertUserSchema, type User, users } from "../db/schema.ts";
import type { ErrorResponse, SuccessResponse } from "../types.ts";
import { generateToken } from "../utils/jwt.ts";
import { hashPassword } from "../utils/password.ts";

export const authRouter = express.Router();

const RegisterSchema = InsertUserSchema.extend({
	email: z.email("Invalid email format"),
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(50, "Username too long"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

authRouter.post(
	"/register",
	validate({ body: RegisterSchema }),
	async (
		req,
		res: express.Response<
			| SuccessResponse<{
					user: Pick<
						User,
						"id" | "email" | "username" | "firstName" | "lastName" | "createdAt"
					>;
					token: string;
			  }>
			| ErrorResponse
		>,
	) => {
		const { email, username, password, firstName, lastName } = req.body;

		try {
			const hashedPassword = await hashPassword(password);

			const [user] = await db
				.insert(users)
				.values({
					email,
					username,
					password: hashedPassword,
					firstName,
					lastName,
				})
				.returning({
					id: users.id,
					email: users.email,
					username: users.username,
					firstName: users.firstName,
					lastName: users.lastName,
					createdAt: users.createdAt,
				});

			const token = await generateToken({
				id: user.id,
				email: user.email,
				username: user.username,
			});

			res.status(201).json({
				success: true,
				message: "User created",
				data: { user, token },
			});
		} catch (error) {
			console.error("Registration error:", error);

			res.status(500).json({ success: false, error: "Failed to create user" });
		}
	},
);

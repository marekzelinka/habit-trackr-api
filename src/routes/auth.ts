import { eq } from "drizzle-orm";
import express from "express";
import validate from "express-zod-safe";
import z from "zod";
import { db } from "../db/connection.ts";
import { InsertUserSchema, users } from "../db/schema.ts";
import { generateToken } from "../utils/jwt.ts";
import { comparePassword, hashPassword } from "../utils/password.ts";

export const authRouter = express.Router();

const RegisterSchema = InsertUserSchema.extend({
	email: z.email("Invalid email format"),
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(50, "Username too long"),
	password: z.string().min(8, "Password must be at least 8 characters"),
}).pick({
	email: true,
	username: true,
	password: true,
	firstName: true,
	lastName: true,
});

authRouter.post(
	"/register",
	validate({ body: RegisterSchema }),
	async (req, res) => {
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

const LoginSchema = InsertUserSchema.extend({
	email: z.email("Invalid email format"),
	password: z.string().min(1, "Password is required"),
}).pick({
	email: true,
	password: true,
});

authRouter.post("/login", validate({ body: LoginSchema }), async (req, res) => {
	const { email, password } = req.body;

	try {
		const [user] = await db
			.select({
				id: users.id,
				email: users.email,
				username: users.username,
				password: users.password,
				firstName: users.firstName,
				lastName: users.lastName,
			})
			.from(users)
			.where(eq(users.email, email));

		if (!user) {
			res.status(401).json({ success: false, error: "Invalid credentials" });

			return;
		}

		const isValidPassword = await comparePassword(password, user.password);

		if (!isValidPassword) {
			res.status(401).json({ success: false, error: "Invalid credentials" });

			return;
		}

		const token = await generateToken({
			id: user.id,
			email: user.email,
			username: user.username,
		});

		res.json({
			success: true,
			message: "Login successful",
			data: {
				user: {
					id: user.id,
					email: user.email,
					username: user.username,
					firstName: user.firstName,
					lastName: user.lastName,
				},
				token,
			},
		});
	} catch (error) {
		console.error("Login error:", error);

		res.status(500).json({ success: false, error: "Failed to login" });
	}
});

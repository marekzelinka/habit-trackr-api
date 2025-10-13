import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { db } from "../db/connection.ts";
import {
	InsertUserSchema,
	SelectUserSchema,
	type User,
	users,
} from "../db/schema.ts";
import type { SuccessResponse } from "../types.ts";
import { generateToken } from "../utils/jwt.ts";
import { comparePassword, hashPassword } from "../utils/password.ts";

export const authRouter = new Hono()
	.post(
		"/register",
		zValidator(
			"json",
			InsertUserSchema.pick({
				email: true,
				username: true,
				password: true,
				firstName: true,
				lastName: true,
			}),
		),
		async (c) => {
			const { email, username, password, firstName, lastName } =
				c.req.valid("json");

			try {
				const hashedPassword = await hashPassword(password);

				const [user] = await db
					.insert(users)
					.values({
						email,
						username,
						// Store hashed password, not plain text!
						password: hashedPassword,
						firstName,
						lastName,
					})
					.returning({
						id: users.id,
						email: users.email,
						username: users.username,
						// password excluded
					});

				// const token = await generateToken({
				// 	id: user.id,
				// 	email: user.email,
				// 	username: user.username,
				// });

				return c.json<
					SuccessResponse<{
						user: Pick<User, "id" | "email" | "username">;
					}>
				>(
					{
						success: true,
						message: "User created",
						data: { user },
					},
					201,
				);
			} catch {
				throw new HTTPException(500, { message: "Failed to create user" });
			}
		},
	)
	.post(
		"/login",
		zValidator("json", SelectUserSchema.pick({ email: true, password: true })),
		async (c) => {
			const { email, password } = c.req.valid("json");

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
					throw new HTTPException(401, {
						message: "Incorrect username or password",
					});
				}

				const isValidPassword = await comparePassword(password, user.password);

				if (!isValidPassword) {
					throw new HTTPException(401, {
						message: "Incorrect username or password",
					});
				}

				const token = await generateToken({
					id: user.id,
					email: user.email,
					username: user.username,
				});

				return c.json<
					SuccessResponse<{
						user: Pick<User, "id" | "email" | "username">;
						token: string;
					}>
				>({
					success: true,
					message: "Logged in",
					data: {
						user: {
							id: user.id,
							email: user.email,
							username: user.username,
							// password excluded
						},
						token,
					},
				});
			} catch {
				throw new HTTPException(500, { message: "Failed to login" });
			}
		},
	);

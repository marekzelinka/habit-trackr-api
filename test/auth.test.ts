import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { app } from "../src/app.ts";
import { cleanupDatabase, createTestUser } from "./utils/db.ts";

describe("Authentication Endpoints", () => {
	afterEach(async () => {
		await cleanupDatabase();
	});

	describe("POST /api/auth/register", () => {
		it("should register a new user with valid data", async () => {
			const validUserData = {
				email: `test-${Date.now()}@example.com`,
				username: `testuser-${Date.now()}`,
				password: "TestPassword123",
			};

			const response = await request(app)
				.post("/api/auth/register")
				.send(validUserData);

			expect(response.statusCode).toBe(201);
			expect(response.body).toHaveProperty("message", "User created");
			expect(response.body).toHaveProperty("data");
			expect(response.body.data).toHaveProperty("user");
			expect(response.body.data.user).not.toHaveProperty("password");
			expect(response.body.data).toHaveProperty("token");
		});

		it("should return 400 for invalid email", async () => {
			const invalidUserData = {
				email: `test-${Date.now()}`,
				username: `testuser-${Date.now()}`,
				password: "TestPassword123",
			};

			const response = await request(app)
				.post("/api/auth/register")
				.send(invalidUserData);

			expect(response.statusCode).toBe(400);
			expect(response.body[0].errors[0].message).toMatch(/invalid email/i);
		});

		it("should return 400 for short email", async () => {
			const invalidUserData = {
				email: `test-${Date.now()}@example.com`,
				username: `testuser-${Date.now()}`,
				password: "123",
			};

			const response = await request(app)
				.post("/api/auth/register")
				.send(invalidUserData);

			expect(response.statusCode).toBe(400);
			expect(response.body[0].errors[0].message).toMatch(
				/password must be at least 8 characters/i,
			);
		});
	});

	describe("POST /api/auth/login", () => {
		it("should login with valid credentials", async () => {
			const validCredentials = {
				email: `test-${Date.now()}@example.com`,
				password: "123",
			};

			// Create a test user in db first
			await createTestUser(validCredentials);

			const response = await request(app)
				.post("/api/auth/login")
				.send(validCredentials);

			expect(response.statusCode).toBe(200);
			expect(response.body).toHaveProperty("message", "Login successful");
			expect(response.body).toHaveProperty("data");
			expect(response.body.data).toHaveProperty("user");
			expect(response.body.data.user).not.toHaveProperty("password");
			expect(response.body.data).toHaveProperty("token");
		});

		it("should return 400 for missing email", async () => {
			const invalidCredentials = {
				password: "123",
			};

			// We don't need a user in the db here at all, because the test should
			// fail during data validation
			const response = await request(app)
				.post("/api/auth/login")
				.send(invalidCredentials);

			expect(response.statusCode).toBe(400);
			expect(response.body[0].errors[0].message).toMatch(
				/invalid email format/i,
			);
		});

		it("should return 400 for invalid credentials", async () => {
			const { user } = await createTestUser();

			const invalidCredentials = {
				email: user.email,
				password: "wrong-password123",
			};

			const response = await request(app)
				.post("/api/auth/login")
				.send(invalidCredentials);
			console.log(response.body);

			expect(response.statusCode).toBe(401);
			expect(response.body).toHaveProperty("error", "Invalid credentials");
		});
	});
});

import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { app } from "../src/app.ts";
import {
	cleanupDatabase,
	createTestHabit,
	createTestUser,
} from "./utils/db.ts";

describe("Habits API", () => {
	afterEach(async () => {
		await cleanupDatabase();
	});

	describe("POST /api/habits", () => {
		it("should create a new habit", async () => {
			const validHabitObject = {
				name: "Exercise daily",
				description: "Daily exercise routine",
				frequency: "daily",
				targetCount: 1,
			};

			const { token } = await createTestUser();

			const response = await request(app)
				.post("/api/habits")
				.set("Authorization", `Bearer ${token}`)
				.send(validHabitObject);

			expect(response.statusCode).toBe(201);
			expect(response.body.data.habit).toBeDefined();
			expect(response.body).toHaveProperty(
				"data.habit.name",
				validHabitObject.name,
			);
		});

		it("should require authentication", async () => {
			const validNewHabitData = {
				name: "Exercise daily",
				frequency: "daily",
			};

			const response = await request(app)
				.post("/api/habits")
				.send(validNewHabitData);

			expect(response.statusCode).toBe(401);
		});

		it("should validate data", async () => {
			const invalidNewHabitData = {
				name: "          ",
				frequency: "hourly",
			};

			const { token } = await createTestUser();

			const response = await request(app)
				.post("/api/habits")
				.set("Authorization", `Bearer ${token}`)
				.send(invalidNewHabitData);

			expect(response.statusCode).toBe(400);
		});
	});

	describe("POST /api/habits/:habitId/complete", () => {
		it("should mark habit as completed", async () => {
			const { user, token } = await createTestUser();

			const habit = await createTestHabit(user.id);

			const response = await request(app)
				.post(`/api/habits/${habit.id}/complete`)
				.set("Authorization", `Bearer ${token}`)
				.send({});

			expect(response.statusCode).toBe(201);
			expect(response.body.data.entry).toBeDefined();
		});

		it("should prevent duplicate completion attempts on the same day", async () => {
			const { user, token } = await createTestUser();

			const habit = await createTestHabit(user.id);

			// Complete the habit for the first time
			await request(app)
				.post(`/api/habits/${habit.id}/complete`)
				.set("Authorization", `Bearer ${token}`)
				.send({});

			// Complete the habit for the second time
			// This should return an error
			const response = await request(app)
				.post(`/api/habits/${habit.id}/complete`)
				.set("Authorization", `Bearer ${token}`)
				.send({});

			expect(response.statusCode).toBe(400);
		});
	});

	describe("GET /api/habits/", () => {
		it("should get all user habits", async () => {
			const { user, token } = await createTestUser();

			await createTestHabit(user.id);

			const response = await request(app)
				.get("/api/habits")
				.set("Authorization", `Bearer ${token}`);

			expect(response.statusCode).toBe(200);
			expect(Array.isArray(response.body.data.habits)).toBe(true);
			expect(response.body.data.habits.length).toBeGreaterThan(0);
		});

		it("should return an empty array for user with no habits", async () => {
			const { token } = await createTestUser();

			const response = await request(app)
				.get("/api/habits")
				.set("Authorization", `Bearer ${token}`);

			expect(response.statusCode).toBe(200);
			expect(Array.isArray(response.body.data.habits)).toBe(true);
			expect(response.body.data.habits.length).toBe(0);
		});
	});

	describe("PUT /api/habits/:habitId", () => {
		it("should update a habit", async () => {
			const { user, token } = await createTestUser();

			const habit = await createTestHabit(user.id);

			const validHabitUpdates = {
				name: "Read for 30 minutes",
				description: "Extended reading time",
			};

			const response = await request(app)
				.put(`/api/habits/${habit.id}`)
				.set("Authorization", `Bearer ${token}`)
				.send(validHabitUpdates);

			expect(response.statusCode).toBe(200);
			expect(response.body.data.habit.name).toBe(validHabitUpdates.name);
		});

		it("should return 400 for non-existent habit", async () => {
			const { token } = await createTestUser();

			const fakeHabitId = "00000000-0000-0000-0000-000000000000";
			const validHabitUpdates = {
				name: "Read for 30 minutes",
			};

			const response = await request(app)
				.put(`/api/habits/${fakeHabitId}`)
				.set("Authorization", `Bearer ${token}`)
				.send(validHabitUpdates);

			expect(response.statusCode).toBe(404);
		});
	});

	describe("DELETE /api/habits/:habitId", () => {
		it("should delete a habit", async () => {
			const { user, token } = await createTestUser();

			const habitToDelete = await createTestHabit(user.id, {
				name: "Temporary habit",
				description: "To be deleted",
			});

			const response = await request(app)
				.delete(`/api/habits/${habitToDelete.id}`)
				.set("Authorization", `Bearer ${token}`);

			expect(response.statusCode).toBe(200);
			expect(response.body).toHaveProperty("message", "Habit deleted");
		});

		it("should return 400 for non-existent habit", async () => {
			const { token } = await createTestUser();

			const fakeHabitToDeleteId = "00000000-0000-0000-0000-000000000000";

			const response = await request(app)
				.delete(`/api/habits/${fakeHabitToDeleteId}`)
				.set("Authorization", `Bearer ${token}`);

			expect(response.statusCode).toBe(404);
		});
	});
});

import { db } from "../../src/db/connection.ts";
import {
	entries,
	type Habit,
	habits,
	type User,
	users,
} from "../../src/db/schema.ts";
import { generateToken } from "../../src/utils/jwt.ts";
import { hashPassword } from "../../src/utils/password.ts";

export async function createTestUser(
	userData: Partial<
		Pick<User, "email" | "username" | "password" | "firstName" | "lastName">
	> = {},
) {
	const defaultData = {
		email: `test-${Date.now()}-${Math.random()}@example.com`,
		username: `testuser-${Date.now()}-${Math.random()}`,
		password: "TestPassword123!",
		firstName: "Test",
		lastName: "User",
		...userData,
	};

	const hashedPassword = await hashPassword(defaultData.password);
	const [user] = await db
		.insert(users)
		.values({
			...defaultData,
			password: hashedPassword,
		})
		.returning({
			id: users.id,
			email: users.email,
			username: users.username,
		});

	const token = await generateToken({
		id: user.id,
		email: user.email,
		username: user.username,
	});

	return { user, token };
}

export async function createTestHabit(
	userId: User["id"],
	habitData: Partial<
		Pick<Habit, "name" | "description" | "frequency" | "targetCount">
	> = {},
) {
	const defaultData = {
		name: `Test Habit ${Date.now()}`,
		description: "A test habit",
		frequency: "daily" as const,
		targetCount: 1,
		...habitData,
	};

	const [habit] = await db
		.insert(habits)
		.values({
			userId,
			...defaultData,
		})
		.returning();

	return habit;
}

export async function cleanupDatabase() {
	// Clean up in the right order due to foreign key constraints
	await db.delete(entries);
	await db.delete(habits);
	await db.delete(users);
}

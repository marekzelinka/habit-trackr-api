import { execSync } from "node:child_process";
import { sql } from "drizzle-orm";
import { db } from "../src/db/connection.ts";
import { entries, habits, users } from "../src/db/schema.ts";

export async function setup() {
	console.log("🗄️  Setting up test database...");

	try {
		// Drop all tables if they exist to ensure clean state
		await db.execute(sql`DROP TABLE IF EXISTS ${entries} CASCADE`);
		await db.execute(sql`DROP TABLE IF EXISTS ${habits} CASCADE`);
		await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`);

		// Use drizzle-kit CLI to push schema to database
		console.log("🚀 Pushing schema using drizzle-kit...");
		execSync(
			`npx drizzle-kit push --url="${process.env.DATABASE_URL}" --schema="./src/db/schema.ts" --dialect="postgresql"`,
			{
				stdio: "inherit",
				cwd: process.cwd(),
			},
		);

		console.log("✅ Test database setup complete");
	} catch (error) {
		console.error("❌ Failed to setup test database:", error);
		throw error;
	}

	return async () => {
		console.log("🧹 Tearing down test database...");

		try {
			// Final cleanup - drop all test data
			await db.execute(sql`DROP TABLE IF EXISTS ${entries} CASCADE`);
			await db.execute(sql`DROP TABLE IF EXISTS ${habits} CASCADE`);
			await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`);

			console.log("✅ Test database teardown complete");
			process.exit(0);
		} catch (error) {
			console.error("❌ Failed to teardown test database:", error);
		}
	};
}

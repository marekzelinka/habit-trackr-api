import { remember } from "@epic-web/remember";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env, isProdEnv } from "../../env.ts";
import * as schema from "./schema.ts";

function createPool() {
	const pool = new Pool({ connectionString: env.DATABASE_URL });

	return pool;
}

let pool: Pool;

if (isProdEnv()) {
	pool = createPool();
} else {
	// In development, reuse the same pool across restarts
	pool = remember("dbPool", () => createPool());
}

export const db = drizzle({ client: pool, schema });

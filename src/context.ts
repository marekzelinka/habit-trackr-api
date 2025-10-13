import type { Env } from "hono";
import type { User } from "./db/schema";

export interface Context extends Env {
	Variables: {
		user: User | null;
	};
}

import bcrypt from "bcrypt";
import { env } from "../../env.ts";

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, env.BCRYPT_ROUNDS);
}

import { createSecretKey } from "node:crypto";
import { type JWTPayload, SignJWT } from "jose";
import { env } from "../../env.ts";

export interface JwtPayload extends JWTPayload {
	id: string;
	email: string;
	username: string;
}

export async function generateToken(payload: JwtPayload): Promise<string> {
	if (!env.JWT_SECRET) {
		throw new Error("JWT_SECRET environment variable is not set");
	}

	const secretKey = createSecretKey(env.JWT_SECRET, "utf-8");

	return new SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime(env.JWT_EXPIRES_IN)
		.sign(secretKey);
}

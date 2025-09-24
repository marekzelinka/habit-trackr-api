import { createSecretKey } from "node:crypto";
import {
	type JWTPayload as _JWTPayload,
	decodeJwt,
	jwtVerify,
	SignJWT,
} from "jose";
import { env } from "../../env.ts";

export interface JWTPayload extends _JWTPayload {
	id: string;
	email: string;
	username: string;
}

export async function generateToken(payload: JWTPayload): Promise<string> {
	const secretKey = createSecretKey(env.JWT_SECRET, "utf-8");

	return new SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime(env.JWT_EXPIRES_IN)
		.sign(secretKey);
}

export async function verifyToken(token: string): Promise<JWTPayload> {
	const secretKey = createSecretKey(env.JWT_SECRET, "utf-8");

	const { payload } = await jwtVerify<JWTPayload>(token, secretKey);

	return {
		id: payload.id,
		email: payload.email,
		username: payload.username,
	};
}

export function decodeToken(token: string): JWTPayload | null {
	try {
		const payload = decodeJwt<JWTPayload>(token);

		return {
			id: payload.id,
			email: payload.email,
			username: payload.username,
		};
	} catch {
		return null;
	}
}

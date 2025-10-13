import { createSecretKey } from "node:crypto";
import {
	decode as decodeJWT,
	sign as signJWT,
	verify as verifyJWT,
} from "hono/jwt";
import type { JWTPayload as _JWTPayload } from "hono/utils/jwt/types";
import { decodeJwt, jwtVerify, SignJWT } from "jose";
import { env } from "../../env.ts";

export interface JWTPayload extends _JWTPayload {
	id: string;
	email: string;
	username: string;
}

export async function generateToken(payload: JWTPayload): Promise<string> {
	const secretKey = env.JWT_SECRET;

	const signAlgorithm = "HS256";
	return signJWT(
		{
			...payload,
			// Token expires in x minutes
			exp: Math.floor(Date.now() / 1000) + 60 * env.JWT_EXPIRES_IN,
		},
		secretKey,
		signAlgorithm,
	);
}

export async function verifyToken(token: string): Promise<JWTPayload> {
	const secretKey = env.JWT_SECRET;

	const payload = (await verifyJWT(token, secretKey)) as JWTPayload;

	return {
		id: payload.id,
		email: payload.email,
		username: payload.username,
	};
}

export function decodeToken(token: string): JWTPayload | null {
	try {
		const payload = decodeJWT(token).payload as JWTPayload;

		return {
			id: payload.id,
			email: payload.email,
			username: payload.username,
		};
	} catch {
		return null;
	}
}

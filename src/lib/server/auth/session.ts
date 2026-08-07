import { createHash } from "node:crypto";
import type { Cookies } from "@sveltejs/kit";
import { EncryptJWT, jwtDecrypt } from "jose";
import type { Session } from "$lib/types/spotify";
import { getSessionSecret } from "../env";

const COOKIE_NAME = "session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function getKey() {
	return createHash("sha256").update(getSessionSecret()).digest();
}

export async function encryptSession(session: Session): Promise<string> {
	return new EncryptJWT({ ...session })
		.setProtectedHeader({ alg: "dir", enc: "A256GCM" })
		.setIssuedAt()
		.setExpirationTime("30d")
		.encrypt(getKey());
}

export async function decryptSession(token: string): Promise<Session | null> {
	try {
		const { payload } = await jwtDecrypt(token, getKey());
		return payload as unknown as Session;
	} catch {
		return null;
	}
}

export async function getSession(cookies: Cookies): Promise<Session | null> {
	const token = cookies.get(COOKIE_NAME);
	if (!token) return null;
	return decryptSession(token);
}

export async function setSessionCookie(
	cookies: Cookies,
	session: Session,
): Promise<void> {
	const token = await encryptSession(session);
	cookies.set(COOKIE_NAME, token, {
		path: "/",
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: COOKIE_MAX_AGE,
	});
}

export function clearSessionCookie(cookies: Cookies): void {
	cookies.delete(COOKIE_NAME, { path: "/" });
}

export type { Session };

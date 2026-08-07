import type { Cookies } from "@sveltejs/kit";
import type { Session } from "$lib/types/spotify";
import { setSessionCookie } from "../auth/session";
import { refreshAccessToken } from "../auth/spotify-oauth";

/** Refresh the access token this many ms before Spotify expiry. */
const REFRESH_BUFFER_MS = 60_000;

/** Refreshes and rewrites the session cookie when the access token is near expiry. */
export async function ensureFreshSession(
	session: Session,
	cookies: Cookies,
): Promise<Session> {
	if (session.expiresAt - REFRESH_BUFFER_MS > Date.now()) {
		return session;
	}

	const tokens = await refreshAccessToken(session.refreshToken);
	const refreshed: Session = {
		...session,
		accessToken: tokens.accessToken,
		refreshToken: tokens.refreshToken,
		expiresAt: tokens.expiresAt,
	};

	await setSessionCookie(cookies, refreshed);
	return refreshed;
}

export async function spotifyFetch<T>(
	session: Session,
	path: string,
	init?: RequestInit,
): Promise<T> {
	const url = path.startsWith("https://")
		? path
		: `https://api.spotify.com/v1${path}`;
	const response = await fetch(url, {
		...init,
		headers: {
			Authorization: `Bearer ${session.accessToken}`,
			...(init?.headers ?? {}),
		},
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Spotify API error ${response.status}: ${text}`);
	}

	return response.json() as Promise<T>;
}

export async function getCurrentUser(
	session: Session,
): Promise<{ id: string; display_name: string }> {
	return spotifyFetch<{ id: string; display_name: string }>(session, "/me");
}

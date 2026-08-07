import { error, redirect } from "@sveltejs/kit";
import { OAUTH_STATE_COOKIE } from "$lib/server/auth/constants";
import { setSessionCookie } from "$lib/server/auth/session";
import { exchangeCodeForTokens } from "$lib/server/auth/spotify-oauth";
import { getCurrentUser } from "$lib/server/spotify/client";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const storedState = cookies.get(OAUTH_STATE_COOKIE);

	cookies.delete(OAUTH_STATE_COOKIE, { path: "/" });

	if (!code) {
		error(400, "Missing authorization code");
	}

	if (!state || !storedState || state !== storedState) {
		error(400, "Invalid OAuth state");
	}

	const tokens = await exchangeCodeForTokens(code);
	const user = await getCurrentUser({
		spotifyUserId: "",
		displayName: "",
		accessToken: tokens.accessToken,
		refreshToken: tokens.refreshToken,
		expiresAt: tokens.expiresAt,
	});

	await setSessionCookie(cookies, {
		spotifyUserId: user.id,
		displayName: user.display_name ?? "Spotify User",
		accessToken: tokens.accessToken,
		refreshToken: tokens.refreshToken,
		expiresAt: tokens.expiresAt,
	});

	throw redirect(302, "/dashboard");
};

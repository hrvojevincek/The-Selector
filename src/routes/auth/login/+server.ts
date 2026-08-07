import { redirect } from "@sveltejs/kit";
import { OAUTH_STATE_COOKIE } from "$lib/server/auth/constants";
import {
	buildAuthorizeUrl,
	generateOAuthState,
} from "$lib/server/auth/spotify-oauth";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ cookies }) => {
	const state = generateOAuthState();
	cookies.set(OAUTH_STATE_COOKIE, state, {
		path: "/",
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 600,
	});

	throw redirect(302, buildAuthorizeUrl(state));
};

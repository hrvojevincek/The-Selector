import { randomBytes } from "node:crypto";
import type { TokenSet } from "$lib/types/spotify";
import {
	getSpotifyClientId,
	getSpotifyClientSecret,
	getSpotifyRedirectUri,
} from "../env";

const SCOPES = [
	"playlist-read-private",
	"playlist-read-collaborative",
	"user-top-read",
	"user-follow-read",
].join(" ");

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const AUTHORIZE_URL = "https://accounts.spotify.com/authorize";

type SpotifyTokenResponse = {
	access_token: string;
	refresh_token?: string;
	expires_in: number;
	token_type: string;
};

function basicAuthHeader(): string {
	const id = getSpotifyClientId();
	const secret = getSpotifyClientSecret();
	return `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
}

export function buildAuthorizeUrl(state: string): string {
	const params = new URLSearchParams({
		client_id: getSpotifyClientId(),
		response_type: "code",
		redirect_uri: getSpotifyRedirectUri(),
		scope: SCOPES,
		state,
	});
	return `${AUTHORIZE_URL}?${params.toString()}`;
}

export function generateOAuthState(): string {
	return randomBytes(32).toString("hex");
}

export async function exchangeCodeForTokens(code: string): Promise<TokenSet> {
	const body = new URLSearchParams({
		grant_type: "authorization_code",
		code,
		redirect_uri: getSpotifyRedirectUri(),
	});

	const response = await fetch(TOKEN_URL, {
		method: "POST",
		headers: {
			Authorization: basicAuthHeader(),
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body,
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(
			`Spotify token exchange failed: ${response.status} ${text}`,
		);
	}

	const data = (await response.json()) as SpotifyTokenResponse;
	return {
		accessToken: data.access_token,
		refreshToken: data.refresh_token ?? "",
		expiresAt: Date.now() + data.expires_in * 1000,
	};
}

export async function refreshAccessToken(
	refreshToken: string,
): Promise<TokenSet> {
	const body = new URLSearchParams({
		grant_type: "refresh_token",
		refresh_token: refreshToken,
	});

	const response = await fetch(TOKEN_URL, {
		method: "POST",
		headers: {
			Authorization: basicAuthHeader(),
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body,
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Spotify token refresh failed: ${response.status} ${text}`);
	}

	const data = (await response.json()) as SpotifyTokenResponse;
	return {
		accessToken: data.access_token,
		refreshToken: data.refresh_token ?? refreshToken,
		expiresAt: Date.now() + data.expires_in * 1000,
	};
}

import { env } from "$env/dynamic/private";

function required(name: string): string {
	const value = env[name];
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

export function getSpotifyClientId(): string {
	return required("SPOTIFY_CLIENT_ID");
}

export function getSpotifyClientSecret(): string {
	return required("SPOTIFY_CLIENT_SECRET");
}

export function getSpotifyRedirectUri(): string {
	return required("SPOTIFY_REDIRECT_URI");
}

export function getSessionSecret(): string {
	return required("SESSION_SECRET");
}

export function getYoutubeApiKey(): string | undefined {
	return env.YOUTUBE_API_KEY;
}

export function getRedisUrl(): string | undefined {
	return env.REDIS_URL;
}

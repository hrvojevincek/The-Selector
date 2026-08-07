import { type Handle, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { dev } from "$app/environment";
import { getSession } from "$lib/server/auth/session";
import { ensureFreshSession } from "$lib/server/spotify/client";

const PROTECTED_PREFIXES = ["/dashboard", "/portfolio"];

/** Spotify local redirect uses 127.0.0.1; cookies are host-scoped — not localhost. */
const loopbackRedirect: Handle = async ({ event, resolve }) => {
	if (dev && event.url.hostname === "localhost") {
		const url = new URL(event.url);
		url.hostname = "127.0.0.1";
		throw redirect(302, url.toString());
	}
	return resolve(event);
};

const authHandle: Handle = async ({ event, resolve }) => {
	let session = await getSession(event.cookies);

	if (session) {
		try {
			session = await ensureFreshSession(session, event.cookies);
		} catch {
			session = null;
		}
	}

	event.locals.session = session;

	const pathname = event.url.pathname;
	const isProtected = PROTECTED_PREFIXES.some((prefix) =>
		pathname.startsWith(prefix),
	);

	if (isProtected && !session) {
		throw redirect(302, "/");
	}

	if (
		pathname === "/api/find-mixes" &&
		event.request.method === "POST" &&
		!session
	) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	return resolve(event);
};

export const handle = sequence(loopbackRedirect, authHandle);

import { json } from "@sveltejs/kit";
import { findMixesJob } from "$lib/server/jobs/find-mixes";
import { checkRateLimit } from "$lib/server/rate-limit";
import type { FindMixesInput } from "$lib/types/jobs";
import type { RequestHandler } from "./$types";

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_ARTISTS = 20;

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = locals.session;
	if (!session) {
		return json({ error: "Unauthorized" }, { status: 401 });
	}

	const rate = checkRateLimit(
		`find-mixes:${session.spotifyUserId}`,
		RATE_LIMIT,
		RATE_WINDOW_MS,
	);
	if (!rate.allowed) {
		return json(
			{ error: "Rate limit exceeded", retryAfterMs: rate.retryAfterMs },
			{ status: 429 },
		);
	}

	let body: FindMixesInput;
	try {
		body = await request.json();
	} catch {
		return json({ error: "Invalid JSON body" }, { status: 400 });
	}

	if (!body.artists?.length) {
		return json({ error: "At least one artist is required" }, { status: 400 });
	}

	if (body.artists.length > MAX_ARTISTS) {
		return json(
			{ error: `Maximum ${MAX_ARTISTS} artists per request` },
			{ status: 400 },
		);
	}

	const output = await findMixesJob(body);
	return json(output);
};

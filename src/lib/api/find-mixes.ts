import type { FindMixesInput, FindMixesOutput } from "$lib/types/jobs";

type FindMixesArtist = FindMixesInput["artists"][number];

/**
 * POST /api/find-mixes — requires an authenticated session cookie.
 * @throws Error with server message on non-2xx responses.
 */
export async function postFindMixes(
	artists: FindMixesArtist[],
): Promise<FindMixesOutput> {
	const response = await fetch("/api/find-mixes", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ artists } satisfies FindMixesInput),
	});

	if (!response.ok) {
		const payload = await response.json().catch(() => ({}));
		throw new Error(
			typeof payload.error === "string"
				? payload.error
				: `Search failed (${response.status})`,
		);
	}

	return response.json() as Promise<FindMixesOutput>;
}

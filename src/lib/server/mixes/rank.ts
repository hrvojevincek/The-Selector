import type { MixSearchResult } from "$lib/types/mix";

export function normalizeArtistName(name: string): string {
	return name.toLowerCase().trim().replace(/\s+/g, " ");
}

/** Title relevance: +10 if full artist name in title, +2 per word (length > 2). */
export function mixMatchScore(
	normalizedArtist: string,
	mix: MixSearchResult,
): number {
	const haystack = mix.title.toLowerCase();
	let score = 0;
	if (haystack.includes(normalizedArtist)) score += 10;
	for (const word of normalizedArtist.split(" ")) {
		if (word.length > 2 && haystack.includes(word)) score += 2;
	}
	return score;
}

/** Dedupe by mix key, rank by title match score, then play count. */
export function rankAndLimit(
	artistName: string,
	mixes: MixSearchResult[],
	maxResults: number,
): MixSearchResult[] {
	const deduped = new Map<string, MixSearchResult>();
	for (const mix of mixes) {
		deduped.set(mix.key, mix);
	}

	const normalized = normalizeArtistName(artistName);

	return [...deduped.values()]
		.sort((a, b) => {
			const scoreA = mixMatchScore(normalized, a);
			const scoreB = mixMatchScore(normalized, b);
			if (scoreB !== scoreA) return scoreB - scoreA;
			return b.playCount - a.playCount;
		})
		.slice(0, maxResults);
}

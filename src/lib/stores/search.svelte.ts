import type { FindMixesOutput } from "$lib/types/jobs";
import type { MixSearchResult } from "$lib/types/mixcloud";
import type { ArtistSummary } from "$lib/types/spotify";

type SearchMeta = FindMixesOutput["meta"];

/**
 * Client-only in-memory store for portfolio results (v1 — no persistence).
 * Cleared on full page reload; portfolio redirects to dashboard when empty.
 */
function createSearchStore() {
	let artists = $state<ArtistSummary[]>([]);
	let results = $state<Record<string, MixSearchResult[]>>({});
	let meta = $state<SearchMeta | null>(null);

	return {
		get artists() {
			return artists;
		},
		get results() {
			return results;
		},
		get meta() {
			return meta;
		},
		setSearch(payload: {
			artists: ArtistSummary[];
			results: Record<string, MixSearchResult[]>;
			meta: SearchMeta;
		}) {
			artists = payload.artists;
			results = payload.results;
			meta = payload.meta;
		},
		mergeArtistResults(spotifyId: string, mixes: MixSearchResult[]) {
			results = { ...results, [spotifyId]: mixes };
		},
		clear() {
			artists = [];
			results = {};
			meta = null;
		},
	};
}

export const searchStore = createSearchStore();

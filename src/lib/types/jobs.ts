import type { MixSearchResult } from "./mix";

export type FindMixesInput = {
	/** Spotify artist IDs and display names to search across mix platforms. */
	artists: { spotifyId: string; name: string }[];
	options?: { maxResultsPerArtist?: number };
};

export type FindMixesOutput = {
	/** Mix results keyed by Spotify artist ID. */
	results: Record<string, MixSearchResult[]>;
	meta: {
		/** Artists served from cache (not refetched). */
		cached: number;
		/** Artists fetched from external APIs this run. */
		fetched: number;
		durationMs: number;
	};
};

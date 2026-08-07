import type { MixSearchResult } from "$lib/types/mixcloud";
import { getYoutubeApiKey } from "../env";

/**
 * Stub for YouTube Data API v3 DJ mix search.
 * Returns an empty array until `YOUTUBE_API_KEY` is set and the client is implemented.
 *
 * @see README — reserved env var `YOUTUBE_API_KEY`
 */
export async function searchDjMixes(
	_artistName: string,
): Promise<MixSearchResult[]> {
	if (!getYoutubeApiKey()) return [];
	return [];
}

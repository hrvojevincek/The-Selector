import type { MixSearchResult } from "$lib/types/mix";
import { getYoutubeApiKey } from "../env";
import { rankAndLimit } from "../mixes/rank";

const BASE_URL = "https://www.googleapis.com/youtube/v3";
const SEARCH_LIMIT = 15;

type YoutubeSearchItem = {
	id?: { videoId?: string };
	snippet?: {
		title?: string;
		thumbnails?: {
			high?: { url?: string };
			medium?: { url?: string };
			default?: { url?: string };
		};
	};
};

type YoutubeSearchResponse = {
	items?: YoutubeSearchItem[];
};

type YoutubeVideoItem = {
	id?: string;
	statistics?: { viewCount?: string };
	contentDetails?: { duration?: string };
};

type YoutubeVideosResponse = {
	items?: YoutubeVideoItem[];
};

function parseIso8601Duration(iso: string): number {
	const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
	if (!match) return 0;
	const hours = Number(match[1] ?? 0);
	const minutes = Number(match[2] ?? 0);
	const seconds = Number(match[3] ?? 0);
	return hours * 3600 + minutes * 60 + seconds;
}

function toEmbedUrl(videoId: string): string {
	return `https://www.youtube.com/embed/${videoId}`;
}

async function youtubeFetch<T>(
	path: string,
	params: URLSearchParams,
): Promise<T> {
	const apiKey = getYoutubeApiKey();
	if (!apiKey) return { items: [] } as T;

	params.set("key", apiKey);
	const url = `${BASE_URL}${path}?${params.toString()}`;
	const response = await fetch(url, {
		headers: { Accept: "application/json" },
	});

	if (!response.ok) {
		throw new Error(`YouTube API error ${response.status} for ${path}`);
	}

	return response.json() as Promise<T>;
}

async function searchVideos(query: string): Promise<YoutubeSearchItem[]> {
	const params = new URLSearchParams({
		part: "snippet",
		type: "video",
		q: query,
		videoDuration: "long",
		maxResults: String(SEARCH_LIMIT),
	});
	const response = await youtubeFetch<YoutubeSearchResponse>("/search", params);
	return response.items ?? [];
}

async function getVideoDetails(
	videoIds: string[],
): Promise<Map<string, YoutubeVideoItem>> {
	if (!videoIds.length) return new Map();

	const params = new URLSearchParams({
		part: "contentDetails,statistics",
		id: videoIds.join(","),
	});
	const response = await youtubeFetch<YoutubeVideosResponse>("/videos", params);
	const map = new Map<string, YoutubeVideoItem>();
	for (const item of response.items ?? []) {
		if (item.id) map.set(item.id, item);
	}
	return map;
}

function mapVideoToResult(
	videoId: string,
	snippet: NonNullable<YoutubeSearchItem["snippet"]>,
	details: YoutubeVideoItem | undefined,
): MixSearchResult {
	const duration = parseIso8601Duration(
		details?.contentDetails?.duration ?? "",
	);
	const viewCount = Number(details?.statistics?.viewCount ?? 0);

	return {
		title: snippet.title ?? "Untitled",
		url: `https://www.youtube.com/watch?v=${videoId}`,
		key: `youtube:${videoId}`,
		platform: "youtube",
		duration,
		playCount: viewCount,
		thumbnail:
			snippet.thumbnails?.high?.url ??
			snippet.thumbnails?.medium?.url ??
			snippet.thumbnails?.default?.url ??
			null,
		embedUrl: toEmbedUrl(videoId),
		source: "search",
	};
}

/**
 * Search YouTube for long DJ mixes by artist name.
 * Requires `YOUTUBE_API_KEY`. Returns [] when unset.
 */
export async function searchDjMixes(
	artistName: string,
	maxResults = 5,
): Promise<MixSearchResult[]> {
	if (!getYoutubeApiKey()) return [];

	const query = `${artistName} DJ mix`;
	const searchResults = await searchVideos(query);
	const videoIds = searchResults
		.map((item) => item.id?.videoId)
		.filter((id): id is string => Boolean(id));

	const details = await getVideoDetails(videoIds);

	const mixes = searchResults
		.map((item) => {
			const videoId = item.id?.videoId;
			if (!videoId || !item.snippet) return null;
			return mapVideoToResult(videoId, item.snippet, details.get(videoId));
		})
		.filter((mix): mix is MixSearchResult => mix !== null);

	return rankAndLimit(artistName, mixes, maxResults);
}

import type { MixSearchResult } from "$lib/types/mix";
import type { MixcloudCloudcast } from "$lib/types/mixcloud";

export function dedupeMixes(mixes: MixSearchResult[]): MixSearchResult[] {
	const seen = new Map<string, MixSearchResult>();
	for (const mix of mixes) {
		if (!seen.has(mix.key)) seen.set(mix.key, mix);
	}
	return [...seen.values()];
}

export function scoreCloudcastForArtist(
	artistName: string,
	cloudcast: MixcloudCloudcast,
): number {
	const normalized = artistName.toLowerCase();
	const haystack =
		`${cloudcast.name} ${cloudcast.user?.name ?? ""} ${cloudcast.user?.username ?? ""}`.toLowerCase();
	let score = cloudcast.play_count ?? 0;
	if (haystack.includes(normalized)) score += 10_000;
	return score;
}

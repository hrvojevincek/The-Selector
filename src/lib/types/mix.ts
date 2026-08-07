export type MixPlatform = "mixcloud" | "youtube";

export type MixSource = "search" | "user";

export type MixSearchResult = {
	title: string;
	url: string;
	key: string;
	platform: MixPlatform;
	duration: number;
	playCount: number;
	thumbnail: string | null;
	embedUrl: string;
	source: MixSource;
};

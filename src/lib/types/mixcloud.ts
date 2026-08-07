export type { MixPlatform, MixSearchResult, MixSource } from "./mix";

export type MixcloudCloudcast = {
	key: string;
	url: string;
	name: string;
	play_count: number;
	pictures?: { medium?: string; large?: string; small?: string };
	audio_length?: number;
	user?: { name?: string; username?: string };
};

export type MixcloudUser = {
	key: string;
	name: string;
	username: string;
};

export type MixcloudSearchResponse = {
	data?: MixcloudCloudcast[] | MixcloudUser[];
	paging?: { next?: string };
};

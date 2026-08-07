export type TokenSet = {
	accessToken: string;
	refreshToken: string;
	expiresAt: number;
};

export type Session = {
	spotifyUserId: string;
	displayName: string;
	accessToken: string;
	refreshToken: string;
	expiresAt: number;
};

/** Where the artist was discovered in the user's Spotify library. */
export type ArtistSource = "top" | "followed" | "playlist";

export type ArtistSummary = {
	id: string;
	name: string;
	imageUrl: string | null;
	sources: ArtistSource[];
};

export type PlaylistSummary = {
	id: string;
	name: string;
	imageUrl: string | null;
	trackCount: number;
};

export type SpotifyArtist = {
	id: string;
	name: string;
	images?: { url: string; height: number; width: number }[];
};

export type SpotifyPlaylistRef = {
	total?: number;
};

export type SpotifyPlaylist = {
	id: string;
	name: string;
	images?: { url: string }[];
	/** Feb 2026+ — replaces deprecated `tracks` ref on SimplifiedPlaylistObject. */
	items?: SpotifyPlaylistRef;
	/** @deprecated Use `items` instead (Spotify Feb 2026 API). */
	tracks?: SpotifyPlaylistRef;
};

export type SpotifyUser = {
	id: string;
	display_name: string;
};

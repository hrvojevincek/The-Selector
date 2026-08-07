import type {
	ArtistSource,
	ArtistSummary,
	Session,
	SpotifyArtist,
} from "$lib/types/spotify";
import { spotifyFetch } from "./client";

type TopArtistsResponse = {
	items: SpotifyArtist[];
};

type FollowedArtistsResponse = {
	artists: {
		items: SpotifyArtist[];
		next: string | null;
	};
};

type PlaylistTracksResponse = {
	items: {
		track: {
			artists?: SpotifyArtist[];
		} | null;
	}[];
	next: string | null;
};

function artistImage(artist: SpotifyArtist): string | null {
	return artist.images?.[0]?.url ?? null;
}

function mergeArtist(
	map: Map<string, ArtistSummary>,
	artist: SpotifyArtist,
	source: ArtistSource,
) {
	const existing = map.get(artist.id);
	if (existing) {
		if (!existing.sources.includes(source)) {
			existing.sources.push(source);
		}
		if (!existing.imageUrl && artistImage(artist)) {
			existing.imageUrl = artistImage(artist);
		}
		return;
	}

	map.set(artist.id, {
		id: artist.id,
		name: artist.name,
		imageUrl: artistImage(artist),
		sources: [source],
	});
}

export async function getTopArtists(
	session: Session,
	limit = 50,
): Promise<SpotifyArtist[]> {
	const response = await spotifyFetch<TopArtistsResponse>(
		session,
		`/me/top/artists?limit=${limit}&time_range=medium_term`,
	);
	return response.items;
}

export async function getFollowedArtists(
	session: Session,
	limit = 50,
): Promise<SpotifyArtist[]> {
	const response = await spotifyFetch<FollowedArtistsResponse>(
		session,
		`/me/following?type=artist&limit=${limit}`,
	);
	return response.artists.items;
}

export async function getPlaylistArtists(
	session: Session,
	playlistIds: string[],
	maxPlaylists = 5,
	maxTracksPerPlaylist = 100,
): Promise<SpotifyArtist[]> {
	const artists: SpotifyArtist[] = [];
	const seen = new Set<string>();
	const playlists = playlistIds.slice(0, maxPlaylists);

	for (const playlistId of playlists) {
		let path: string | null =
			`/playlists/${playlistId}/tracks?limit=50&fields=items(track(artists(id,name,images))),next`;
		let trackCount = 0;

		while (path && trackCount < maxTracksPerPlaylist) {
			const response: PlaylistTracksResponse = await spotifyFetch(
				session,
				path,
			);

			for (const item of response.items) {
				if (!item.track?.artists) continue;
				for (const artist of item.track.artists) {
					if (!seen.has(artist.id)) {
						seen.add(artist.id);
						artists.push(artist);
					}
				}
				trackCount++;
				if (trackCount >= maxTracksPerPlaylist) break;
			}

			path = response.next;
		}
	}

	return artists;
}

/**
 * Merge top artists, followed artists, and optionally playlist track artists.
 * Playlist scan is capped at 5 playlists × 100 tracks each.
 */
export async function collectArtists(
	session: Session,
	options: { scanPlaylists?: boolean; playlistIds?: string[] } = {},
): Promise<ArtistSummary[]> {
	const map = new Map<string, ArtistSummary>();

	const [topArtists, followedArtists] = await Promise.all([
		getTopArtists(session),
		getFollowedArtists(session),
	]);

	for (const artist of topArtists) mergeArtist(map, artist, "top");
	for (const artist of followedArtists) mergeArtist(map, artist, "followed");

	if (options.scanPlaylists && options.playlistIds?.length) {
		const playlistArtists = await getPlaylistArtists(
			session,
			options.playlistIds,
		);
		for (const artist of playlistArtists) mergeArtist(map, artist, "playlist");
	}

	return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

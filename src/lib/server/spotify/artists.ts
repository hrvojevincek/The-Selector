import type {
	ArtistSource,
	ArtistSummary,
	Session,
	SpotifyArtist,
} from "$lib/types/spotify";
import { normalizeSpotifyNextUrl, spotifyFetch } from "./client";

type TopArtistsResponse = {
	items: SpotifyArtist[];
};

type FollowedArtistsResponse = {
	artists: {
		items: SpotifyArtist[];
		next: string | null;
	};
};

type PlaylistItemsResponse = {
	items: {
		item: {
			artists?: SpotifyArtist[];
			album?: {
				images?: { url: string; height: number; width: number }[];
			};
		} | null;
	}[];
	next: string | null;
};

const SPOTIFY_ID_RE = /^[A-Za-z0-9]{22}$/;

function isValidSpotifyId(id: string | undefined): id is string {
	return typeof id === "string" && SPOTIFY_ID_RE.test(id);
}

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
): Promise<SpotifyArtist[]> {
	const artists: SpotifyArtist[] = [];
	let path: string | null = "/me/following?type=artist&limit=50";

	while (path) {
		const response: FollowedArtistsResponse = await spotifyFetch(session, path);
		artists.push(...response.artists.items);
		path = normalizeSpotifyNextUrl(response.artists.next);
	}

	return artists;
}

/** Image URLs keyed by artist id — from endpoints that return full artist objects. */
export function buildArtistImageLookup(
	artists: SpotifyArtist[],
): Map<string, string | null> {
	const lookup = new Map<string, string | null>();
	for (const artist of artists) {
		const image = artistImage(artist);
		const existing = lookup.get(artist.id);
		if (existing === undefined) {
			lookup.set(artist.id, image);
		} else if (!existing && image) {
			lookup.set(artist.id, image);
		}
	}
	return lookup;
}

type ArtistSearchResponse = {
	artists: {
		items: SpotifyArtist[];
	};
};

type ArtistAlbumsResponse = {
	items: { id: string }[];
};

type AlbumTracksResponse = {
	items: {
		artists?: SpotifyArtist[];
	}[];
};

/** Max artists to return for the similar list. */
const SIMILAR_ARTISTS_LIMIT = 30;
/** Search `limit` max after Feb 2026 Spotify API changes. */
const SEARCH_LIMIT = 10;

function escapeSearchTerm(value: string): string {
	return value.replace(/"/g, "");
}

/**
 * Artists similar to the given artist.
 *
 * `GET /artists/{id}/related-artists` returns 403 for apps created after
 * Nov 2024, so we approximate similarity via genre search, then fill gaps
 * with album collaborators.
 */
export async function getRelatedArtists(
	session: Session,
	artistId: string,
): Promise<SpotifyArtist[]> {
	if (!isValidSpotifyId(artistId)) return [];

	const seed = await spotifyFetch<SpotifyArtist>(
		session,
		`/artists/${artistId}`,
	);

	const byId = new Map<string, SpotifyArtist>();

	const genres = (seed.genres ?? [])
		.map((g) => g.trim())
		.filter(Boolean)
		.slice(0, 3);

	await Promise.all(
		genres.map(async (genre) => {
			const q = encodeURIComponent(`genre:"${escapeSearchTerm(genre)}"`);
			try {
				const response = await spotifyFetch<ArtistSearchResponse>(
					session,
					`/search?q=${q}&type=artist&limit=${SEARCH_LIMIT}`,
				);
				for (const artist of response.artists.items) {
					if (
						isValidSpotifyId(artist.id) &&
						artist.id !== artistId &&
						!byId.has(artist.id)
					) {
						byId.set(artist.id, artist);
					}
				}
			} catch {
				// Genre search can fail for obscure labels — keep going.
			}
		}),
	);

	if (byId.size < SIMILAR_ARTISTS_LIMIT) {
		const collaborators = await getAlbumCollaborators(session, artistId);
		for (const artist of collaborators) {
			if (artist.id === artistId || byId.has(artist.id)) continue;
			byId.set(artist.id, artist);
			if (byId.size >= SIMILAR_ARTISTS_LIMIT) break;
		}
	}

	return [...byId.values()].slice(0, SIMILAR_ARTISTS_LIMIT);
}

/** Other artists credited on the seed artist's recent albums/singles. */
async function getAlbumCollaborators(
	session: Session,
	artistId: string,
): Promise<SpotifyArtist[]> {
	const albums = await spotifyFetch<ArtistAlbumsResponse>(
		session,
		`/artists/${artistId}/albums?include_groups=album,single&limit=10`,
	);

	const albumIds = albums.items
		.map((a) => a.id)
		.filter(isValidSpotifyId)
		.slice(0, 5);
	const collaboratorIds = new Set<string>();

	await Promise.all(
		albumIds.map(async (albumId) => {
			try {
				const tracks = await spotifyFetch<AlbumTracksResponse>(
					session,
					`/albums/${albumId}/tracks?limit=50`,
				);
				for (const track of tracks.items) {
					for (const artist of track.artists ?? []) {
						if (isValidSpotifyId(artist.id) && artist.id !== artistId) {
							collaboratorIds.add(artist.id);
						}
					}
				}
			} catch {
				// Skip albums that fail (403/404) and continue.
			}
		}),
	);

	if (collaboratorIds.size === 0) return [];

	return getArtistsByIds(
		session,
		[...collaboratorIds].slice(0, SIMILAR_ARTISTS_LIMIT),
	);
}

/**
 * Fetch full artist objects (incl. images) by id.
 * Uses GET /artists/{id} — Get Several Artists (`GET /artists?ids=`) was removed
 * in Spotify's February 2026 Web API changes.
 * @see https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide
 */
export async function getArtistsByIds(
	session: Session,
	ids: string[],
	concurrency = 8,
): Promise<SpotifyArtist[]> {
	const uniqueIds = [...new Set(ids.filter(isValidSpotifyId))];
	const artists: SpotifyArtist[] = [];

	for (let i = 0; i < uniqueIds.length; i += concurrency) {
		const batch = uniqueIds.slice(i, i + concurrency);
		const results = await Promise.all(
			batch.map(async (id) => {
				try {
					return await spotifyFetch<SpotifyArtist>(session, `/artists/${id}`);
				} catch {
					return null;
				}
			}),
		);

		for (const artist of results) {
			if (artist && isValidSpotifyId(artist.id)) {
				artists.push(artist);
			}
		}
	}

	return artists;
}

export async function getPlaylistArtists(
	session: Session,
	playlistIds: string[],
	maxPlaylists = 5,
	maxTracksPerPlaylist?: number,
): Promise<SpotifyArtist[]> {
	/** Playlist track artists lack images; use album art as a display fallback. */
	const artistsById = new Map<
		string,
		{ name: string; imageUrl: string | null }
	>();
	const playlists = playlistIds.slice(0, maxPlaylists);

	for (const playlistId of playlists) {
		let path: string | null =
			`/playlists/${playlistId}/items?limit=50&fields=items(item(artists(id,name),album(images))),next`;
		let trackCount = 0;

		while (
			path &&
			(maxTracksPerPlaylist === undefined || trackCount < maxTracksPerPlaylist)
		) {
			const response: PlaylistItemsResponse = await spotifyFetch(session, path);

			for (const item of response.items) {
				if (!item.item?.artists) continue;
				const albumImage = item.item.album?.images?.[0]?.url ?? null;
				for (const artist of item.item.artists) {
					if (!isValidSpotifyId(artist.id)) continue;
					const existing = artistsById.get(artist.id);
					if (!existing) {
						artistsById.set(artist.id, {
							name: artist.name,
							imageUrl: albumImage,
						});
					} else if (!existing.imageUrl && albumImage) {
						existing.imageUrl = albumImage;
					}
				}
				trackCount++;
				if (
					maxTracksPerPlaylist !== undefined &&
					trackCount >= maxTracksPerPlaylist
				) {
					break;
				}
			}

			path = normalizeSpotifyNextUrl(response.next);
		}
	}

	return [...artistsById.entries()]
		.map(([id, { name, imageUrl }]) => ({
			id,
			name,
			images: imageUrl ? [{ url: imageUrl, height: 0, width: 0 }] : undefined,
		}))
		.sort((a, b) => a.name.localeCompare(b.name));
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
			5,
			100,
		);
		for (const artist of playlistArtists) mergeArtist(map, artist, "playlist");
	}

	return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

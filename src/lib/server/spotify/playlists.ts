import type {
	PlaylistSummary,
	Session,
	SpotifyPlaylist,
} from "$lib/types/spotify";
import { spotifyFetch } from "./client";

type PlaylistsResponse = {
	items: SpotifyPlaylist[];
	next: string | null;
};

function toPlaylistSummary(playlist: SpotifyPlaylist): PlaylistSummary {
	return {
		id: playlist.id,
		name: playlist.name,
		imageUrl: playlist.images?.[0]?.url ?? null,
		trackCount: playlist.items?.total ?? playlist.tracks?.total ?? 0,
	};
}

export async function getUserPlaylists(
	session: Session,
): Promise<PlaylistSummary[]> {
	const response = await spotifyFetch<PlaylistsResponse>(
		session,
		"/me/playlists?limit=50",
	);

	return response.items.map(toPlaylistSummary);
}

export async function getPlaylist(
	session: Session,
	playlistId: string,
): Promise<PlaylistSummary> {
	const playlist = await spotifyFetch<SpotifyPlaylist>(
		session,
		`/playlists/${playlistId}?fields=id,name,images,items(total),tracks(total)`,
	);
	return toPlaylistSummary(playlist);
}

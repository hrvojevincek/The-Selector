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

export async function getUserPlaylists(
	session: Session,
): Promise<PlaylistSummary[]> {
	const response = await spotifyFetch<PlaylistsResponse>(
		session,
		"/me/playlists?limit=50",
	);

	return response.items.map((playlist) => ({
		id: playlist.id,
		name: playlist.name,
		imageUrl: playlist.images?.[0]?.url ?? null,
		trackCount: playlist.items?.total ?? playlist.tracks?.total ?? 0,
	}));
}

import { error, redirect } from "@sveltejs/kit";
import { paginate, parsePageParam } from "$lib/pagination";
import {
	buildArtistImageLookup,
	getFollowedArtists,
	getPlaylistArtists,
	getTopArtists,
} from "$lib/server/spotify/artists";
import { getPlaylist } from "$lib/server/spotify/playlists";
import type { ArtistSource, ArtistSummary } from "$lib/types/spotify";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params, url }) => {
	if (!locals.session) {
		throw redirect(302, "/");
	}

	try {
		const session = locals.session;
		const page = parsePageParam(url.searchParams.get("page"));
		const [playlist, trackArtists, topArtists, followedArtists] =
			await Promise.all([
				getPlaylist(session, params.id),
				getPlaylistArtists(session, [params.id], 1),
				getTopArtists(session),
				getFollowedArtists(session),
			]);

		// Prefer real artist images from top/followed; fall back to album art
		// from playlist tracks (Get Several Artists was removed in Feb 2026).
		const imageLookup = buildArtistImageLookup([
			...topArtists,
			...followedArtists,
			...trackArtists,
		]);

		const allArtists: ArtistSummary[] = trackArtists.map((artist) => ({
			id: artist.id,
			name: artist.name,
			imageUrl: imageLookup.get(artist.id) ?? null,
			sources: ["playlist"] as ArtistSource[],
		}));

		const { items: artists, meta: pagination } = paginate(allArtists, page);

		return {
			playlist,
			artists,
			allArtistCount: allArtists.length,
			pagination,
		};
	} catch (err) {
		if (err instanceof Error && err.message.includes("404")) {
			error(404, "Playlist not found");
		}
		throw err;
	}
};

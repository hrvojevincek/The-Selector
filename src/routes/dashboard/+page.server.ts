import { redirect } from "@sveltejs/kit";
import { collectArtists } from "$lib/server/spotify/artists";
import { getUserPlaylists } from "$lib/server/spotify/playlists";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.session) {
		throw redirect(302, "/");
	}

	const scanPlaylists = url.searchParams.get("scanPlaylists") === "1";
	const playlists = await getUserPlaylists(locals.session);
	const artists = await collectArtists(locals.session, {
		scanPlaylists,
		playlistIds: scanPlaylists ? playlists.map((p) => p.id) : [],
	});

	return {
		user: {
			displayName: locals.session.displayName,
			spotifyUserId: locals.session.spotifyUserId,
		},
		playlists,
		artists,
		scanPlaylists,
	};
};

import { redirect } from "@sveltejs/kit";
import { paginate, parsePageParam } from "$lib/pagination";
import { collectArtists } from "$lib/server/spotify/artists";
import { getUserPlaylists } from "$lib/server/spotify/playlists";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.session) {
		throw redirect(302, "/");
	}

	const scanPlaylists = url.searchParams.get("scanPlaylists") === "1";
	const page = parsePageParam(url.searchParams.get("page"));
	const playlists = await getUserPlaylists(locals.session);
	const allArtists = await collectArtists(locals.session, {
		scanPlaylists,
		playlistIds: scanPlaylists ? playlists.map((p) => p.id) : [],
	});
	const { items: artists, meta: pagination } = paginate(allArtists, page);

	return {
		user: {
			displayName: locals.session.displayName,
			spotifyUserId: locals.session.spotifyUserId,
		},
		playlists,
		allArtists,
		artists,
		allArtistCount: allArtists.length,
		pagination,
		scanPlaylists,
	};
};

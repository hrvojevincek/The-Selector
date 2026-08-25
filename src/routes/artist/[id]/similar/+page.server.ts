import { error, redirect } from "@sveltejs/kit";
import {
	getArtistsByIds,
	getRelatedArtists,
} from "$lib/server/spotify/artists";
import type { ArtistSource, ArtistSummary } from "$lib/types/spotify";
import type { PageServerLoad } from "./$types";

const SPOTIFY_ID_RE = /^[A-Za-z0-9]{22}$/;

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.session) {
		throw redirect(302, "/");
	}

	if (!SPOTIFY_ID_RE.test(params.id)) {
		error(404, "Artist not found");
	}

	const session = locals.session;

	try {
		const [seedArtists, related] = await Promise.all([
			getArtistsByIds(session, [params.id]),
			getRelatedArtists(session, params.id),
		]);

		const seed = seedArtists[0];
		if (!seed) {
			error(404, "Artist not found");
		}

		const artists: ArtistSummary[] = related.map((artist) => ({
			id: artist.id,
			name: artist.name,
			imageUrl: artist.images?.[0]?.url ?? null,
			sources: ["related"] as ArtistSource[],
		}));

		return {
			artist: {
				id: seed.id,
				name: seed.name,
				imageUrl: seed.images?.[0]?.url ?? null,
			},
			artists,
		};
	} catch (err) {
		if (err instanceof Error && err.message.includes("404")) {
			error(404, "Artist not found");
		}
		throw err;
	}
};

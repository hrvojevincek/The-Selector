import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: locals.session
			? {
					displayName: locals.session.displayName,
					spotifyUserId: locals.session.spotifyUserId,
				}
			: null,
	};
};

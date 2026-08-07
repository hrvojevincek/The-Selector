import { redirect } from "@sveltejs/kit";
import { clearSessionCookie } from "$lib/server/auth/session";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ cookies }) => {
	clearSessionCookie(cookies);
	throw redirect(302, "/");
};

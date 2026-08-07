// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Session } from "$lib/types/spotify";

declare global {
	namespace App {
		interface Locals {
			session: Session | null;
		}
		interface PageData {
			user: { displayName: string; spotifyUserId: string } | null;
		}
	}
}

export {};

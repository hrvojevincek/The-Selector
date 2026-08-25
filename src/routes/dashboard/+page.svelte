<script lang="ts">
import { goto } from "$app/navigation";
import { postFindMixes } from "$lib/api/find-mixes";
import ArtistGrid from "$lib/components/ArtistGrid.svelte";
import ArtistPagination from "$lib/components/ArtistPagination.svelte";
import PlaylistList from "$lib/components/PlaylistList.svelte";
import { Alert, AlertDescription } from "$lib/components/ui/alert/index.js";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "$lib/components/ui/card/index.js";
import { searchStore } from "$lib/stores/search.svelte";
import type { ArtistSummary } from "$lib/types/spotify";
import type { PageProps } from "./$types";

let { data }: PageProps = $props();

let loadingArtistId = $state<string | null>(null);
let errorMessage = $state<string | null>(null);

function buildPageUrl(page: number) {
	const params = new URLSearchParams();
	if (page > 1) params.set("page", String(page));
	const query = params.toString();
	return query ? `/dashboard?${query}` : "/dashboard";
}

async function openArtistMixes(artist: ArtistSummary) {
	if (loadingArtistId) return;

	loadingArtistId = artist.id;
	errorMessage = null;

	try {
		const output = await postFindMixes([
			{ spotifyId: artist.id, name: artist.name },
		]);

		searchStore.setSearch({
			artists: [artist],
			results: output.results,
			meta: output.meta,
		});

		await goto("/portfolio");
	} catch (err) {
		errorMessage = err instanceof Error ? err.message : "Something went wrong.";
	} finally {
		loadingArtistId = null;
	}
}
</script>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
	<div class="mb-8">
		<h1 class="text-2xl font-semibold tracking-tight">Dashboard</h1>
		<p class="mt-1 text-muted-foreground">
			Click an artist to find DJ mixes on Mixcloud and YouTube.
		</p>
	</div>

	<div class="grid gap-8 lg:grid-cols-[280px_1fr]">
		<Card class="h-fit">
			<CardHeader>
				<CardTitle class="text-base">Library</CardTitle>
			</CardHeader>
			<CardContent>
				<PlaylistList playlists={data.playlists} />
			</CardContent>
		</Card>

		<section class="min-w-0">
			<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 class="text-lg font-medium">Artists</h2>
					<p class="text-sm text-muted-foreground">
						{data.allArtistCount}
						unique
					</p>
				</div>

				<ArtistPagination
					pagination={data.pagination}
					{buildPageUrl}
					variant="inline"
				/>
			</div>

			{#if errorMessage}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			{/if}

			<ArtistGrid
				artists={data.artists}
				onArtistClick={openArtistMixes}
				{loadingArtistId}
				showSources={false}
			/>
		</section>
	</div>
</div>

<script lang="ts">
import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
import LayoutGridIcon from "@lucide/svelte/icons/layout-grid";
import ListIcon from "@lucide/svelte/icons/list";
import Music2Icon from "@lucide/svelte/icons/music-2";
import { goto } from "$app/navigation";
import { postFindMixes } from "$lib/api/find-mixes";
import ArtistGrid, {
	type ArtistViewMode,
} from "$lib/components/ArtistGrid.svelte";
import ArtistPagination from "$lib/components/ArtistPagination.svelte";
import { Alert, AlertDescription } from "$lib/components/ui/alert/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { searchStore } from "$lib/stores/search.svelte";
import type { ArtistSummary } from "$lib/types/spotify";
import type { PageProps } from "./$types";

let { data }: PageProps = $props();

let artistView = $state<ArtistViewMode>("grid");
let loadingArtistId = $state<string | null>(null);
let errorMessage = $state<string | null>(null);

function buildPageUrl(page: number) {
	return page > 1
		? `/playlist/${data.playlist.id}?page=${page}`
		: `/playlist/${data.playlist.id}`;
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
	<Button variant="ghost" size="sm" href="/dashboard" class="mb-6 -ml-2">
		<ArrowLeftIcon class="size-4" />
		Back to dashboard
	</Button>

	<div class="mb-8 flex items-center gap-4">
		<div
			class="size-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-24"
		>
			{#if data.playlist.imageUrl}
				<img
					src={data.playlist.imageUrl}
					alt=""
					class="h-full w-full object-cover"
				>
			{:else}
				<div
					class="flex h-full w-full items-center justify-center text-muted-foreground"
				>
					<Music2Icon class="size-8" />
				</div>
			{/if}
		</div>
		<div class="min-w-0">
			<h1 class="truncate text-2xl font-semibold tracking-tight">
				{data.playlist.name}
			</h1>
			<p class="mt-1 text-muted-foreground">
				{data.playlist.trackCount}
				tracks · {data.allArtistCount} unique artists
			</p>
		</div>
	</div>

	<section class="min-w-0">
		<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
			<div>
				<h2 class="text-lg font-medium">Artists in this playlist</h2>
				<p class="text-sm text-muted-foreground">
					Click an artist to find DJ mixes
				</p>
			</div>

			<div class="flex flex-wrap items-center gap-2">
				<fieldset
					class="m-0 flex min-w-0 rounded-lg border p-0.5"
					aria-label="Artist view mode"
				>
					<Button
						variant={artistView === "grid" ? "secondary" : "ghost"}
						size="sm"
						class="h-8 px-2.5"
						onclick={() => (artistView = "grid")}
						disabled={Boolean(loadingArtistId)}
						aria-pressed={artistView === "grid"}
						aria-label="Card view"
					>
						<LayoutGridIcon class="size-4" />
					</Button>
					<Button
						variant={artistView === "list" ? "secondary" : "ghost"}
						size="sm"
						class="h-8 px-2.5"
						onclick={() => (artistView = "list")}
						disabled={Boolean(loadingArtistId)}
						aria-pressed={artistView === "list"}
						aria-label="List view"
					>
						<ListIcon class="size-4" />
					</Button>
				</fieldset>

				<ArtistPagination
					pagination={data.pagination}
					{buildPageUrl}
					variant="inline"
				/>
			</div>
		</div>

		{#if errorMessage}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{errorMessage}</AlertDescription>
			</Alert>
		{/if}

		{#if data.allArtistCount === 0}
			<p class="text-sm text-muted-foreground">
				No artists found in this playlist.
			</p>
		{:else}
			<ArtistGrid
				artists={data.artists}
				onArtistClick={openArtistMixes}
				{loadingArtistId}
				showSources={false}
				view={artistView}
			/>
		{/if}
	</section>
</div>

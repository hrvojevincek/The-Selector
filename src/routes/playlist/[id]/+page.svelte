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
import LoadingProgress from "$lib/components/LoadingProgress.svelte";
import { Alert, AlertDescription } from "$lib/components/ui/alert/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { searchStore } from "$lib/stores/search.svelte";
import type { PageProps } from "./$types";

let { data }: PageProps = $props();

let selectedIds = $state<Set<string>>(new Set());
let artistView = $state<ArtistViewMode>("grid");
let loading = $state(false);
let errorMessage = $state<string | null>(null);
let progressCurrent = $state(0);
let progressTotal = $state(0);

function toggleArtist(id: string) {
	if (loading) return;
	const next = new Set(selectedIds);
	if (next.has(id)) next.delete(id);
	else next.add(id);
	selectedIds = next;
}

function selectAll() {
	selectedIds = new Set(data.artists.map((a) => a.id));
}

function clearSelection() {
	selectedIds = new Set();
}

async function findMixes() {
	const selectedArtists = data.artists.filter((a) => selectedIds.has(a.id));
	if (!selectedArtists.length) {
		errorMessage = "Select at least one artist.";
		return;
	}

	if (selectedArtists.length > 20) {
		errorMessage = "Select at most 20 artists per search.";
		return;
	}

	loading = true;
	errorMessage = null;
	progressCurrent = 0;
	progressTotal = selectedArtists.length;

	try {
		const output = await postFindMixes(
			selectedArtists.map((a) => ({ spotifyId: a.id, name: a.name })),
		);

		progressCurrent = progressTotal;

		searchStore.setSearch({
			artists: selectedArtists,
			results: output.results,
			meta: output.meta,
		});

		await goto("/portfolio");
	} catch (err) {
		errorMessage = err instanceof Error ? err.message : "Something went wrong.";
	} finally {
		loading = false;
	}
}
</script>

<div class="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 lg:pb-8">
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
				tracks · {data.artists.length} unique artists
			</p>
		</div>
	</div>

	<section class="min-w-0">
		<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
			<div>
				<h2 class="text-lg font-medium">Artists in this playlist</h2>
				<p class="text-sm text-muted-foreground">{selectedIds.size} selected</p>
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
						disabled={loading}
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
						disabled={loading}
						aria-pressed={artistView === "list"}
						aria-label="List view"
					>
						<ListIcon class="size-4" />
					</Button>
				</fieldset>
				<Button
					variant="outline"
					size="sm"
					onclick={selectAll}
					disabled={loading || data.artists.length === 0}
				>
					Select all
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={clearSelection}
					disabled={loading}
				>
					Clear
				</Button>
			</div>
		</div>

		{#if loading}
			<div class="mb-4">
				<LoadingProgress
					current={progressCurrent}
					total={progressTotal}
					message="Searching Mixcloud for DJ mixes..."
				/>
			</div>
		{/if}

		{#if errorMessage}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{errorMessage}</AlertDescription>
			</Alert>
		{/if}

		{#if data.artists.length === 0}
			<p class="text-sm text-muted-foreground">
				No artists found in the first 100 tracks of this playlist.
			</p>
		{:else}
			<ArtistGrid
				artists={data.artists}
				{selectedIds}
				onToggle={toggleArtist}
				view={artistView}
			/>
		{/if}
	</section>

	<div
		class="fixed inset-x-0 bottom-0 border-t bg-background/95 p-4 backdrop-blur-md lg:static lg:mt-8 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
	>
		<div class="mx-auto flex max-w-7xl justify-end">
			<Button
				class="w-full rounded-full sm:w-auto"
				size="lg"
				onclick={findMixes}
				disabled={loading || selectedIds.size === 0}
			>
				{loading ? "Searching..." : "Find DJ Mixes"}
			</Button>
		</div>
	</div>
</div>

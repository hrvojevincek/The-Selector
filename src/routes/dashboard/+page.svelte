<script lang="ts">
import { goto } from "$app/navigation";
import { postFindMixes } from "$lib/api/find-mixes";
import ArtistGrid from "$lib/components/ArtistGrid.svelte";
import ArtistPagination from "$lib/components/ArtistPagination.svelte";
import LoadingProgress from "$lib/components/LoadingProgress.svelte";
import PlaylistList from "$lib/components/PlaylistList.svelte";
import { Alert, AlertDescription } from "$lib/components/ui/alert/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "$lib/components/ui/card/index.js";
import { Checkbox } from "$lib/components/ui/checkbox/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Separator } from "$lib/components/ui/separator/index.js";
import { searchStore } from "$lib/stores/search.svelte";
import type { PageProps } from "./$types";

let { data }: PageProps = $props();

let selectedIds = $state<Set<string>>(new Set());
let loading = $state(false);
let errorMessage = $state<string | null>(null);
let progressCurrent = $state(0);
let progressTotal = $state(0);

function toggleArtist(id: string) {
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

function togglePlaylistScan() {
	const next = data.scanPlaylists ? "0" : "1";
	goto(`/dashboard?scanPlaylists=${next}`, { invalidateAll: true });
}

function buildPageUrl(page: number) {
	const params = new URLSearchParams();
	if (data.scanPlaylists) params.set("scanPlaylists", "1");
	if (page > 1) params.set("page", String(page));
	const query = params.toString();
	return query ? `/dashboard?${query}` : "/dashboard";
}

async function findMixes() {
	const selectedArtists = data.allArtists.filter((a) => selectedIds.has(a.id));
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

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
	<div class="mb-8">
		<h1 class="text-2xl font-semibold tracking-tight">Dashboard</h1>
		<p class="mt-1 text-muted-foreground">
			Select artists and find DJ mixes on Mixcloud and YouTube.
		</p>
	</div>

	<div class="grid gap-8 lg:grid-cols-[280px_1fr]">
		<Card class="h-fit">
			<CardHeader>
				<CardTitle class="text-base">Library</CardTitle>
			</CardHeader>
			<CardContent class="space-y-6">
				<PlaylistList playlists={data.playlists} />

				<Separator />

				<div class="flex items-start gap-3 rounded-lg border p-3">
					<Checkbox
						id="scan-playlists"
						class="mt-0.5"
						checked={data.scanPlaylists}
						onCheckedChange={togglePlaylistScan}
					/>
					<div class="space-y-1 leading-none">
						<Label for="scan-playlists" class="font-medium"
							>Include artists from playlists</Label
						>
						<p class="text-xs text-muted-foreground">
							Deep-scans up to 5 playlists (slower on first load).
						</p>
					</div>
				</div>
			</CardContent>
		</Card>

		<section class="min-w-0">
			<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 class="text-lg font-medium">Artists</h2>
					<p class="text-sm text-muted-foreground">
						{data.allArtistCount}
						unique · {selectedIds.size} selected
						{#if data.pagination.totalPages > 1}
							· page {data.pagination.page} of {data.pagination.totalPages}
						{/if}
					</p>
				</div>

				<div class="flex flex-wrap gap-2">
					<Button
						variant="outline"
						size="sm"
						onclick={selectAll}
						disabled={loading}
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
						message="Searching Mixcloud and YouTube..."
					/>
				</div>
			{/if}

			{#if errorMessage}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			{/if}

			<ArtistGrid
				artists={data.artists}
				{selectedIds}
				onToggle={toggleArtist}
			/>

			<ArtistPagination pagination={data.pagination} {buildPageUrl} />
		</section>
	</div>

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
				{loading ? 'Searching...' : 'Find DJ Mixes'}
			</Button>
		</div>
	</div>
</div>

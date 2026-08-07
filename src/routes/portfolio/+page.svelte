<script lang="ts">
import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
import Music2Icon from "@lucide/svelte/icons/music-2";
import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { postFindMixes } from "$lib/api/find-mixes";
import LoadingProgress from "$lib/components/LoadingProgress.svelte";
import MixCard from "$lib/components/MixCard.svelte";
import { Alert, AlertDescription } from "$lib/components/ui/alert/index.js";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "$lib/components/ui/avatar/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { Card, CardContent } from "$lib/components/ui/card/index.js";
import { Separator } from "$lib/components/ui/separator/index.js";
import { searchStore } from "$lib/stores/search.svelte";
import type { ArtistSummary } from "$lib/types/spotify";

let loadingArtistId = $state<string | null>(null);
let errorMessage = $state<string | null>(null);

// Portfolio reads client-only store state; redirect if user landed here without a search.
onMount(() => {
	if (!searchStore.artists.length) {
		goto("/dashboard");
	}
});

async function reSearchArtist(artist: ArtistSummary) {
	loadingArtistId = artist.id;
	errorMessage = null;

	try {
		const output = await postFindMixes([
			{ spotifyId: artist.id, name: artist.name },
		]);
		searchStore.mergeArtistResults(artist.id, output.results[artist.id] ?? []);
	} catch (err) {
		errorMessage = err instanceof Error ? err.message : "Re-search failed.";
	} finally {
		loadingArtistId = null;
	}
}

const totalMixes = $derived(
	Object.values(searchStore.results).reduce(
		(sum, mixes) => sum + mixes.length,
		0,
	),
);
</script>

<div class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
	<div class="mb-8 flex flex-wrap items-end justify-between gap-4">
		<div>
			<Badge variant="secondary" class="mb-2 uppercase tracking-wide"
				>Portfolio</Badge
			>
			<h1 class="text-2xl font-semibold tracking-tight">DJ Mix Results</h1>
			<p class="mt-1 text-muted-foreground">
				{searchStore.artists.length}
				artists · {totalMixes} mixes found
				{#if searchStore.meta}
					· {searchStore.meta.cached} cached ·
					{searchStore.meta.fetched}
					fetched ·
					{searchStore.meta.durationMs}ms
				{/if}
			</p>
		</div>

		<Button href="/dashboard" variant="outline">
			<ArrowLeftIcon class="size-4" />
			Back to dashboard
		</Button>
	</div>

	{#if errorMessage}
		<Alert variant="destructive" class="mb-6">
			<AlertDescription>{errorMessage}</AlertDescription>
		</Alert>
	{/if}

	<div class="space-y-10">
		{#each searchStore.artists as artist (artist.id)}
			{@const mixes = searchStore.results[artist.id] ?? []}
			<section>
				<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
					<div class="flex items-center gap-3">
						<Avatar class="size-12">
							<AvatarImage
								src={artist.imageUrl ?? undefined}
								alt={artist.name}
							/>
							<AvatarFallback>
								<Music2Icon class="size-4" />
							</AvatarFallback>
						</Avatar>
						<div>
							<h2 class="text-lg font-medium">{artist.name}</h2>
							<p class="text-sm text-muted-foreground">{mixes.length} mixes</p>
						</div>
					</div>

					<Button
						variant="outline"
						size="sm"
						onclick={() => reSearchArtist(artist)}
						disabled={loadingArtistId === artist.id}
					>
						<RefreshCwIcon class="size-4" />
						{loadingArtistId === artist.id ? 'Searching...' : 'Re-search'}
					</Button>
				</div>

				{#if loadingArtistId === artist.id}
					<div class="mb-4">
						<LoadingProgress
							current={0}
							total={1}
							message={`Re-searching ${artist.name}...`}
						/>
					</div>
				{/if}

				{#if mixes.length === 0}
					<Card>
						<CardContent class="py-6 text-sm text-muted-foreground">
							No mixes found for this artist on Mixcloud.
						</CardContent>
					</Card>
				{:else}
					<div class="grid gap-4">
						{#each mixes as mix (mix.key)}
							<MixCard {mix} />
						{/each}
					</div>
				{/if}

				<Separator class="mt-10 last:hidden" />
			</section>
		{/each}
	</div>
</div>

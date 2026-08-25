<script lang="ts">
import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
import Music2Icon from "@lucide/svelte/icons/music-2";
import { goto } from "$app/navigation";
import { postFindMixes } from "$lib/api/find-mixes";
import ArtistGrid from "$lib/components/ArtistGrid.svelte";
import { Alert, AlertDescription } from "$lib/components/ui/alert/index.js";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "$lib/components/ui/avatar/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { searchStore } from "$lib/stores/search.svelte";
import type { ArtistSummary } from "$lib/types/spotify";
import type { PageProps } from "./$types";

let { data }: PageProps = $props();

let loadingArtistId = $state<string | null>(null);
let errorMessage = $state<string | null>(null);

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

<div class="mx-auto max-w-3xl px-4 py-8 sm:px-6">
	<Button variant="ghost" size="sm" href="/portfolio" class="mb-6 -ml-2">
		<ArrowLeftIcon class="size-4" />
		Back to portfolio
	</Button>

	<div class="mb-8 flex items-center gap-4">
		<Avatar class="size-16 sm:size-20">
			<AvatarImage
				src={data.artist.imageUrl ?? undefined}
				alt={data.artist.name}
			/>
			<AvatarFallback>
				<Music2Icon class="size-6" />
			</AvatarFallback>
		</Avatar>
		<div class="min-w-0">
			<h1 class="truncate text-2xl font-semibold tracking-tight">
				Similar to {data.artist.name}
			</h1>
			<p class="mt-1 text-muted-foreground">
				{data.artists.length}
				similar artists · click one to find DJ mixes
			</p>
		</div>
	</div>

	{#if errorMessage}
		<Alert variant="destructive" class="mb-4">
			<AlertDescription>{errorMessage}</AlertDescription>
		</Alert>
	{/if}

	{#if data.artists.length === 0}
		<p class="text-sm text-muted-foreground">
			No similar artists found for {data.artist.name}.
		</p>
	{:else}
		<ArtistGrid
			artists={data.artists}
			onArtistClick={openArtistMixes}
			{loadingArtistId}
			showSources={false}
			view="list"
		/>
	{/if}
</div>

<script lang="ts">
import CheckIcon from "@lucide/svelte/icons/check";
import Music2Icon from "@lucide/svelte/icons/music-2";
import { Badge } from "$lib/components/ui/badge/index.js";
import { Card, CardContent } from "$lib/components/ui/card/index.js";
import type { ArtistSummary } from "$lib/types/spotify";
import { cn } from "$lib/utils.js";

let {
	artist,
	selected = false,
	onToggle,
}: {
	artist: ArtistSummary;
	selected?: boolean;
	onToggle: (id: string) => void;
} = $props();
</script>

<button
	type="button"
	class="group w-full text-left"
	onclick={() => onToggle(artist.id)}
>
	<Card
		class={cn(
			'overflow-hidden py-0 transition-colors hover:bg-accent/50',
			selected && 'border-primary ring-1 ring-primary'
		)}
	>
		<div class="relative aspect-square overflow-hidden bg-muted">
			{#if artist.imageUrl}
				<img
					src={artist.imageUrl}
					alt={artist.name}
					class="h-full w-full object-cover"
				>
			{:else}
				<div
					class="flex h-full w-full items-center justify-center text-muted-foreground"
				>
					<Music2Icon class="size-8" />
				</div>
			{/if}

			<div
				class={cn(
					'absolute right-2 top-2 flex size-6 items-center justify-center rounded-full border bg-background/80',
					selected
						? 'border-primary bg-primary text-primary-foreground'
						: 'border-border text-transparent group-hover:text-muted-foreground'
				)}
			>
				<CheckIcon class="size-3.5" />
			</div>
		</div>

		<CardContent class="p-3">
			<p class="truncate font-medium">{artist.name}</p>
			<div class="mt-2 flex flex-wrap gap-1">
				{#each artist.sources as source (source)}
					<Badge variant="secondary" class="text-[10px] capitalize"
						>{source}</Badge
					>
				{/each}
			</div>
		</CardContent>
	</Card>
</button>

<script lang="ts">
import CheckIcon from "@lucide/svelte/icons/check";
import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
import Music2Icon from "@lucide/svelte/icons/music-2";
import { Badge } from "$lib/components/ui/badge/index.js";
import { Card, CardContent } from "$lib/components/ui/card/index.js";
import type { ArtistSummary } from "$lib/types/spotify";
import { cn } from "$lib/utils.js";

let {
	artist,
	selected = false,
	loading = false,
	onToggle,
	onClick,
}: {
	artist: ArtistSummary;
	selected?: boolean;
	loading?: boolean;
	onToggle?: (id: string) => void;
	onClick?: (artist: ArtistSummary) => void;
} = $props();

const selectable = $derived(Boolean(onToggle));
</script>

<button
	type="button"
	class="group w-full cursor-pointer text-left"
	disabled={loading}
	onclick={() => {
		if (onClick) onClick(artist);
		else onToggle?.(artist.id);
	}}
>
	<Card
		class={cn(
			'overflow-hidden py-0 transition-colors hover:bg-accent/50',
			selected && 'border-primary ring-1 ring-primary',
			loading && 'opacity-70'
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

			{#if loading}
				<div
					class="absolute inset-0 flex items-center justify-center bg-background/60"
				>
					<LoaderCircleIcon class="size-6 animate-spin text-primary" />
				</div>
			{:else if selectable}
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
			{/if}
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

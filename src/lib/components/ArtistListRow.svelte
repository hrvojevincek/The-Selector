<script lang="ts">
import CheckIcon from "@lucide/svelte/icons/check";
import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
import Music2Icon from "@lucide/svelte/icons/music-2";
import { Badge } from "$lib/components/ui/badge/index.js";
import type { ArtistSummary } from "$lib/types/spotify";
import { cn } from "$lib/utils.js";

let {
	artist,
	selected = false,
	loading = false,
	showSources = true,
	onToggle,
	onClick,
}: {
	artist: ArtistSummary;
	selected?: boolean;
	loading?: boolean;
	showSources?: boolean;
	onToggle?: (id: string) => void;
	onClick?: (artist: ArtistSummary) => void;
} = $props();

const selectable = $derived(Boolean(onToggle));
</script>

<button
	type="button"
	aria-pressed={selectable ? selected : undefined}
	disabled={loading}
	class={cn(
		'group flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors hover:bg-accent/50',
		selected && 'border-primary bg-accent/30 ring-1 ring-primary',
		loading && 'opacity-70'
	)}
	onclick={() => {
		if (onClick) onClick(artist);
		else onToggle?.(artist.id);
	}}
>
	<div class="size-10 shrink-0 overflow-hidden rounded-full bg-muted">
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
				<Music2Icon class="size-4" />
			</div>
		{/if}
	</div>

	<div class="min-w-0 flex-1">
		<p class="truncate font-medium">{artist.name}</p>
		{#if showSources && artist.sources.length}
			<div class="mt-1 flex flex-wrap gap-1">
				{#each artist.sources as source (source)}
					<Badge variant="secondary" class="text-[10px] capitalize"
						>{source}</Badge
					>
				{/each}
			</div>
		{/if}
	</div>

	{#if loading}
		<LoaderCircleIcon class="size-5 shrink-0 animate-spin text-primary" />
	{:else if selectable}
		<div
			class={cn(
				'flex size-6 shrink-0 items-center justify-center rounded-full border',
				selected
					? 'border-primary bg-primary text-primary-foreground'
					: 'border-border text-transparent group-hover:text-muted-foreground'
			)}
		>
			<CheckIcon class="size-3.5" />
		</div>
	{/if}
</button>

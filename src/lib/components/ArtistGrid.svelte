<script lang="ts">
import type { ArtistSummary } from "$lib/types/spotify";
import ArtistCard from "./ArtistCard.svelte";
import ArtistListRow from "./ArtistListRow.svelte";

export type ArtistViewMode = "grid" | "list";

let {
	artists,
	selectedIds,
	onToggle,
	view = "grid",
}: {
	artists: ArtistSummary[];
	selectedIds: Set<string>;
	onToggle: (id: string) => void;
	view?: ArtistViewMode;
} = $props();
</script>

{#if view === "list"}
	<div class="space-y-1">
		{#each artists as artist (artist.id)}
			<ArtistListRow
				{artist}
				selected={selectedIds.has(artist.id)}
				{onToggle}
			/>
		{/each}
	</div>
{:else}
	<div
		class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
	>
		{#each artists as artist (artist.id)}
			<ArtistCard {artist} selected={selectedIds.has(artist.id)} {onToggle} />
		{/each}
	</div>
{/if}

<script lang="ts">
import type { ArtistSummary } from "$lib/types/spotify";
import ArtistCard from "./ArtistCard.svelte";

let {
	artists,
	selectedIds,
	onToggle,
}: {
	artists: ArtistSummary[];
	selectedIds: Set<string>;
	onToggle: (id: string) => void;
} = $props();
</script>

<div
	class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
>
	{#each artists as artist (artist.id)}
		<ArtistCard {artist} selected={selectedIds.has(artist.id)} {onToggle} />
	{/each}
</div>

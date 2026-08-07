<script lang="ts">
import Music2Icon from "@lucide/svelte/icons/music-2";
import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
import type { PlaylistSummary } from "$lib/types/spotify";

let { playlists }: { playlists: PlaylistSummary[] } = $props();
</script>

<div class="space-y-3">
	<h2 class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
		Your playlists
	</h2>
	<ScrollArea class="h-[420px]">
		<ul class="space-y-1 pr-3">
			{#each playlists as playlist (playlist.id)}
				<li
					class="flex items-center gap-3 rounded-lg py-2 transition-colors hover:bg-accent/50"
				>
					<div class="size-10 shrink-0 overflow-hidden rounded-md bg-muted">
						{#if playlist.imageUrl}
							<img
								src={playlist.imageUrl}
								alt=""
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
					<div class="min-w-0">
						<p class="truncate text-sm font-medium">{playlist.name}</p>
						<p class="text-xs text-muted-foreground">
							{playlist.trackCount}
							tracks
						</p>
					</div>
				</li>
			{/each}
		</ul>
	</ScrollArea>
</div>

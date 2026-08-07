<script lang="ts">
import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
import PlayIcon from "@lucide/svelte/icons/play";
import { Badge } from "$lib/components/ui/badge/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import {
	Card,
	CardContent,
	CardFooter,
} from "$lib/components/ui/card/index.js";
import type { MixPlatform, MixSearchResult } from "$lib/types/mix";
import MixEmbed from "./MixEmbed.svelte";

let { mix }: { mix: MixSearchResult } = $props();

let showEmbed = $state(false);

const platformLabel: Record<MixPlatform, string> = {
	mixcloud: "Mixcloud",
	youtube: "YouTube",
};

function formatDuration(seconds: number): string {
	if (!seconds) return "";
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	if (h > 0) return `${h}h ${m}m`;
	return `${m} min`;
}

function formatPlays(count: number): string {
	if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M plays`;
	if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K plays`;
	return `${count} plays`;
}
</script>

<Card class="overflow-hidden py-0">
	<CardContent class="flex gap-4 p-4">
		<div class="size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
			{#if mix.thumbnail}
				<img src={mix.thumbnail} alt="" class="h-full w-full object-cover">
			{:else}
				<div
					class="flex h-full w-full items-center justify-center text-muted-foreground"
				>
					<PlayIcon class="size-6" />
				</div>
			{/if}
		</div>

		<div class="min-w-0 flex-1">
			<h3 class="line-clamp-2 font-medium leading-snug">{mix.title}</h3>
			<div class="mt-2 flex flex-wrap items-center gap-2">
				<Badge variant="outline">{platformLabel[mix.platform]}</Badge>
				{#if mix.duration}
					<Badge variant="outline">{formatDuration(mix.duration)}</Badge>
				{/if}
				<Badge variant="secondary">{formatPlays(mix.playCount)}</Badge>
				{#if mix.source === 'user'}
					<Badge>Artist profile</Badge>
				{/if}
			</div>

			<div class="mt-3 flex flex-wrap gap-2">
				<Button size="sm" onclick={() => (showEmbed = !showEmbed)}>
					<PlayIcon class="size-3.5" />
					{showEmbed ? 'Hide player' : 'Play'}
				</Button>
				<Button
					href={mix.url}
					variant="outline"
					size="sm"
					target="_blank"
					rel="noreferrer"
				>
					<ExternalLinkIcon class="size-3.5" />
					Open on {platformLabel[mix.platform]}
				</Button>
			</div>
		</div>
	</CardContent>

	{#if showEmbed}
		<CardFooter class="border-t pt-4 pb-4">
			<MixEmbed
				embedUrl={mix.embedUrl}
				title={mix.title}
				platform={mix.platform}
			/>
		</CardFooter>
	{/if}
</Card>

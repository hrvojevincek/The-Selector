<script lang="ts">
import type { MixPlatform } from "$lib/types/mix";

let {
	embedUrl,
	title,
	platform = "mixcloud",
}: {
	embedUrl: string;
	title: string;
	platform?: MixPlatform;
} = $props();

const height = $derived(platform === "youtube" ? 200 : 120);

const playerLabel = $derived(platform === "youtube" ? "YouTube" : "Mixcloud");
</script>

<div class="w-full overflow-hidden rounded-lg bg-black">
	<iframe
		title="{playerLabel} player: {title}"
		width="100%"
		{height}
		src={embedUrl}
		frameborder="0"
		allow="encrypted-media; autoplay; clipboard-write"
	></iframe>
</div>

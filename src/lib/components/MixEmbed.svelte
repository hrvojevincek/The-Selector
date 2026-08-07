<script lang="ts">
let { embedUrl, title }: { embedUrl: string; title: string } = $props();
</script>

<div class="w-full overflow-hidden rounded-lg bg-black">
	<iframe
		title={`Mixcloud player: ${title}`}
		width="100%"
		height="120"
		src={embedUrl}
		frameborder="0"
		allow="encrypted-media"
	></iframe>
</div>

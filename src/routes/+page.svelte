<script lang="ts">
import { Badge } from "$lib/components/ui/badge/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import type { PageProps } from "./$types";

let { data }: PageProps = $props();
</script>

<section
	class="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center"
>
	<Badge variant="secondary" class="mb-4 uppercase tracking-widest"
		>Spotify × Mixcloud</Badge
	>
	<h1 class="text-4xl font-bold tracking-tight sm:text-5xl">
		Your DJ mix portfolio
	</h1>
	<p class="mt-4 max-w-xl text-muted-foreground">
		Connect Spotify, pull your favorite artists, and discover DJ mixes from
		Mixcloud — all in one clean portfolio view.
	</p>

	{#if data.user}
		<Button href="/dashboard" size="lg" class="mt-8 rounded-full px-8"
			>Go to dashboard</Button
		>
	{:else}
		<Button href="/auth/login" size="lg" class="mt-8 rounded-full px-8"
			>Log in with Spotify</Button
		>
	{/if}
</section>

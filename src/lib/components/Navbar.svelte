<script lang="ts">
import { Button } from "$lib/components/ui/button/index.js";
import { Separator } from "$lib/components/ui/separator/index.js";

let { displayName }: { displayName?: string | null } = $props();
</script>

<header class="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
	<div
		class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6"
	>
		<a href="/" class="text-lg font-semibold tracking-tight">
			<span class="text-primary">DJ</span>
			Mix Portfolio
		</a>

		{#if displayName}
			<div class="flex items-center gap-3">
				<span class="hidden text-sm text-muted-foreground sm:inline"
					>{displayName}</span
				>
				<Separator orientation="vertical" class="hidden h-5 sm:block" />
				<Button href="/auth/logout" variant="outline" size="sm">Log out</Button>
			</div>
		{/if}
	</div>
</header>

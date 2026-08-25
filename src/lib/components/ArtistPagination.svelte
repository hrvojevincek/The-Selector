<script lang="ts">
import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import { Button } from "$lib/components/ui/button/index.js";
import type { PaginationMeta } from "$lib/pagination";
import { cn } from "$lib/utils.js";

let {
	pagination,
	buildPageUrl,
	variant = "default",
}: {
	pagination: PaginationMeta;
	buildPageUrl: (page: number) => string;
	variant?: "default" | "inline";
} = $props();

const { page, totalPages, total, pageSize } = $derived(pagination);
const rangeStart = $derived(total === 0 ? 0 : (page - 1) * pageSize + 1);
const rangeEnd = $derived(Math.min(page * pageSize, total));
const showPagination = $derived(totalPages > 1);
</script>

{#if showPagination}
	<nav
		class={cn(
			'flex flex-wrap items-center gap-3',
			variant === 'default' && 'mt-6 justify-between border-t pt-4',
			variant === 'inline' && 'justify-end'
		)}
		aria-label="Artist pagination"
	>
		{#if variant === "default"}
			<p class="text-sm text-muted-foreground">
				Showing {rangeStart}–{rangeEnd}
				of {total}
			</p>
		{/if}

		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				href={buildPageUrl(page - 1)}
				disabled={page <= 1}
				aria-label="Previous page"
			>
				<ChevronLeftIcon class="size-4" />
				{#if variant === "default"}
					Previous
				{/if}
			</Button>

			<span class="min-w-16 text-center text-sm text-muted-foreground">
				{page}
				/ {totalPages}
			</span>

			<Button
				variant="outline"
				size="sm"
				href={buildPageUrl(page + 1)}
				disabled={page >= totalPages}
				aria-label="Next page"
			>
				{#if variant === "default"}
					Next
				{/if}
				<ChevronRightIcon class="size-4" />
			</Button>
		</div>
	</nav>
{/if}

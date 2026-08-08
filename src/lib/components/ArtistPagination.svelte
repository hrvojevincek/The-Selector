<script lang="ts">
import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import { Button } from "$lib/components/ui/button/index.js";
import type { PaginationMeta } from "$lib/pagination";

let {
	pagination,
	buildPageUrl,
}: {
	pagination: PaginationMeta;
	buildPageUrl: (page: number) => string;
} = $props();

const { page, totalPages, total, pageSize } = $derived(pagination);
const rangeStart = $derived(total === 0 ? 0 : (page - 1) * pageSize + 1);
const rangeEnd = $derived(Math.min(page * pageSize, total));
const showPagination = $derived(totalPages > 1);
</script>

{#if showPagination}
	<nav
		class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4"
		aria-label="Artist pagination"
	>
		<p class="text-sm text-muted-foreground">
			Showing {rangeStart}–{rangeEnd}
			of {total}
		</p>

		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				href={buildPageUrl(page - 1)}
				disabled={page <= 1}
				aria-label="Previous page"
			>
				<ChevronLeftIcon class="size-4" />
				Previous
			</Button>

			<span class="min-w-24 text-center text-sm text-muted-foreground">
				Page {page} of {totalPages}
			</span>

			<Button
				variant="outline"
				size="sm"
				href={buildPageUrl(page + 1)}
				disabled={page >= totalPages}
				aria-label="Next page"
			>
				Next
				<ChevronRightIcon class="size-4" />
			</Button>
		</div>
	</nav>
{/if}

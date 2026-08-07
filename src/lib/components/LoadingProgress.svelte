<script lang="ts">
import { Card, CardContent } from "$lib/components/ui/card/index.js";
import { Progress } from "$lib/components/ui/progress/index.js";

let {
	current,
	total,
	message,
}: {
	current: number;
	total: number;
	message?: string;
} = $props();

const progress = $derived(total > 0 ? Math.round((current / total) * 100) : 0);
</script>

<Card>
	<CardContent class="pt-6">
		<p class="text-sm text-muted-foreground">
			{message ?? `Searching artist ${current} of ${total}...`}
		</p>
		<Progress value={progress} class="mt-3 h-2" />
	</CardContent>
</Card>

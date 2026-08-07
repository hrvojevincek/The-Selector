<script lang="ts">
import "./layout.css";
import favicon from "$lib/assets/favicon.svg";
import Navbar from "$lib/components/Navbar.svelte";
import type { LayoutProps } from "./$types";

let { children, data }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon}>
	<title>DJ Mix Portfolio</title>
</svelte:head>

<Navbar displayName={data.user?.displayName} />
<main>{@render children()}</main>

<script>
	import Hero from '$lib/components/Hero.svelte';
	// import Workspace from './components/Workspace.svelte';
	import Aurora from '$lib/components/Aurora.svelte';
	// import Nomad from './components/Nomad.svelte';
	// import Gallery from './components/Gallery.svelte';
	// import Pricing from './components/Pricing.svelte';
	// import Reviews from './components/Reviews.svelte';
	// import Newsletter from './components/Newsletter.svelte';
	// import MapSection from './components/MapSection.svelte';
	// import Footer from './components/Footer.svelte';
</script>

<main>
	<Hero />
	<!-- <Workspace /> -->
	<Aurora />
	<!-- <Nomad />
	<Gallery />
	<Pricing />
	<Reviews />
	<Newsletter /> -->
	<div style="height: 200vh; padding: 2rem; background: var(--bg); color: var(--text-main);">
		<h1>Scroll Down to See the Header Effect</h1>
		<p>
			This is a demonstration of a sticky header that changes its background color based on scroll
			position. As you scroll down, the header will gradually acquire a background color until it
			becomes fully opaque.
		</p>
		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus
			hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh
			porttitor.
		</p>
		<p>
			Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
			commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
			dolore eu fugiat nulla pariatur.
		</p>
		<p>Scroll further to see the effect...</p>
		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus
			hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh
			porttitor.
		</p>
		<p>
			Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
			commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
			dolore eu fugiat nulla pariatur.
		</p>
		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus
			hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh
			porttitor.
		</p>
		<p>
			Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
			commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
			dolore eu fugiat nulla pariatur.
		</p>
	</div>

	<div class="scroll-indicator" id="scrollIndicator">Scroll Y: 0px</div>
</main>
<!-- <MapSection />
<Footer /> -->

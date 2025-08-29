<script>
	export let name;
	export let desc;
	export let price;
	export let currency = 'L.E';
	export let period;
	export let cta;
</script>

<div class="pricing-card">
	<div class="plan-name">{name}</div>
	<div class="plan-description">{desc}</div>
	<div class="price-container">
		<div class="price">
			{price} <span class="currency">{currency}</span> <span class="period">{period}</span>
		</div>
	</div>
	<button class="cta-button">{cta}</button>
</div>

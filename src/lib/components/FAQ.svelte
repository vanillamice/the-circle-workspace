<script>
	// FAQ Component with interactive accordion
	let activeItem = 0;

	const faqItems = [
		{
			question: "What kind of solutions do you offer?",
			answer: "We offer shared spaces by the day/month and private rooms hourly, along with custom arrangements if needed."
		},
		{
			question: "What's the coffee situation like?",
			answer: "We got a beautiful medium roast and a sturdy coffee machine, and there's always a boiler if you're feeling rebellious."
		},
		{
			question: "How's the noise levels?",
			answer: "We offer different shared spaces for different noise levels. If you're feeling chatty, the chatty room's got your back. If you need quiet, our main circle has that acoustic glass."
		}
	];

	function toggleItem(index) {
		activeItem = activeItem === index ? -1 : index;
	}
</script>

<div class="container">
	<div class="header">
		<h1>Frequently Asked Questions</h1>
		<p>Everything you need to know about our workspace solutions and amenities</p>
	</div>

	<div class="faq-container">
		{#each faqItems as item, index}
			<div class="faq-item" class:active={activeItem === index}>
				<div 
					class="question" 
					tabindex="0" 
					role="button" 
					aria-expanded={activeItem === index}
					on:click={() => toggleItem(index)}
					on:keydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							toggleItem(index);
						}
					}}
				>
					{item.question}
				</div>
				<div class="answer" class:show={activeItem === index}>
					{item.answer}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 80px 20px;
	}

	.header {
		text-align: center;
		margin-bottom: 60px;
	}

	.header h1 {
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 700;
		margin-bottom: 20px;
		color: #333;
	}

	.header p {
		font-size: 1.1rem;
		color: #666;
		max-width: 600px;
		margin: 0 auto;
		line-height: 1.6;
	}

	.faq-container {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.faq-item {
		background: #ffffff;
		border: 1px solid #e9ecef;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
		transition: all 0.3s ease;
	}

	.faq-item:hover {
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}

	.faq-item.active {
		border-color: #00674F;
		box-shadow: 0 4px 20px rgba(0, 102, 79, 0.15);
	}

	.question {
		padding: 25px 30px;
		font-size: 1.1rem;
		font-weight: 600;
		color: #333;
		cursor: pointer;
		position: relative;
		transition: all 0.3s ease;
		user-select: none;
	}

	.question:hover {
		background: #f8f9fa;
		color: #00674F;
	}

	.question::after {
		content: '+';
		position: absolute;
		right: 30px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 1.5rem;
		font-weight: 300;
		color: #00674F;
		transition: transform 0.3s ease;
	}

	.faq-item.active .question::after {
		transform: translateY(-50%) rotate(45deg);
	}

	.answer {
		max-height: 0;
		overflow: hidden;
		transition: max-height 0.3s ease, padding 0.3s ease;
		background: #f8f9fa;
	}

	.answer.show {
		max-height: 200px;
		padding: 0 30px 25px;
	}

	.answer.show::before {
		content: '';
		display: block;
		height: 1px;
		background: #e9ecef;
		margin: 0 -30px 20px;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.container {
			padding: 60px 15px;
		}

		.header {
			margin-bottom: 40px;
		}

		.question {
			padding: 20px 25px;
			font-size: 1rem;
		}

		.answer.show {
			padding: 0 25px 20px;
		}

		.question::after {
			right: 25px;
		}
	}

	@media (max-width: 480px) {
		.container {
			padding: 40px 10px;
		}

		.question {
			padding: 18px 20px;
			font-size: 0.95rem;
		}

		.answer.show {
			padding: 0 20px 18px;
		}

		.question::after {
			right: 20px;
		}
	}
</style>

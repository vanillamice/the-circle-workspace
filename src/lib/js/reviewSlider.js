export function createReviewsCarousel(carouselElement, options = {}) {
	if (!carouselElement) return null;

	const { autoPlayInterval = 5000, swipeThreshold = 50, onIndexChange } = options;

	const reviews = Array.from(carouselElement.querySelectorAll('.review-item'));
	const dots = Array.from(carouselElement.querySelectorAll('.dot'));
	const totalReviews = reviews.length;

	if (totalReviews === 0) return null;

	let currentReviewIndex = 0;
	let autoSlideInterval;

	function showReview(index) {
		// Hide all reviews
		reviews.forEach((review) => {
			review.classList.remove('active');
			review.style.display = 'none';
		});

		// Remove active class from all dots
		dots.forEach((dot) => {
			dot.classList.remove('active');
		});

		// Show current review
		if (reviews[index]) {
			reviews[index].classList.add('active');
			reviews[index].style.display = 'flex';
		}

		// Highlight current dot
		if (dots[index]) {
			dots[index].classList.add('active');
		}

		// Notify Svelte component about index change
		if (onIndexChange && typeof onIndexChange === 'function') {
			onIndexChange(index);
		}
	}

	function nextReview() {
		currentReviewIndex = (currentReviewIndex + 1) % totalReviews;
		showReview(currentReviewIndex);
	}

	function previousReview() {
		currentReviewIndex = (currentReviewIndex - 1 + totalReviews) % totalReviews;
		showReview(currentReviewIndex);
	}

	function goToReview(index) {
		if (index >= 0 && index < totalReviews) {
			currentReviewIndex = index;
			showReview(currentReviewIndex);
		}
	}

	function startAutoPlay() {
		stopAutoPlay();
		autoSlideInterval = setInterval(nextReview, autoPlayInterval);
	}

	function stopAutoPlay() {
		if (autoSlideInterval) {
			clearInterval(autoSlideInterval);
			autoSlideInterval = null;
		}
	}

	// Event handlers
	const mouseEnterHandler = () => stopAutoPlay();
	const mouseLeaveHandler = () => startAutoPlay();

	// Touch handlers
	let startX = 0;
	let endX = 0;

	const touchStartHandler = (e) => {
		startX = e.touches[0].clientX;
		stopAutoPlay(); // Stop autoplay when user starts touching
	};

	const touchEndHandler = (e) => {
		endX = e.changedTouches[0].clientX;
		const diff = startX - endX;

		if (Math.abs(diff) > swipeThreshold) {
			if (diff > 0) {
				nextReview(); // Swipe left - next review
			} else {
				previousReview(); // Swipe right - previous review
			}
		}
		startAutoPlay(); // Resume autoplay after touch
	};

	// Keyboard handler
	const keydownHandler = (e) => {
		if (e.key === 'ArrowLeft') {
			previousReview();
		} else if (e.key === 'ArrowRight') {
			nextReview();
		}
	};

	// Add event listeners
	carouselElement.addEventListener('mouseenter', mouseEnterHandler);
	carouselElement.addEventListener('mouseleave', mouseLeaveHandler);
	carouselElement.addEventListener('touchstart', touchStartHandler);
	carouselElement.addEventListener('touchend', touchEndHandler);
	document.addEventListener('keydown', keydownHandler);

	// Initialize
	showReview(currentReviewIndex);
	startAutoPlay();

	return {
		destroy() {
			stopAutoPlay();
			carouselElement?.removeEventListener('mouseenter', mouseEnterHandler);
			carouselElement?.removeEventListener('mouseleave', mouseLeaveHandler);
			carouselElement?.removeEventListener('touchstart', touchStartHandler);
			carouselElement?.removeEventListener('touchend', touchEndHandler);
			document.removeEventListener('keydown', keydownHandler);
		},
		nextReview,
		previousReview,
		goToReview,
		getCurrentIndex: () => currentReviewIndex,
		setOnIndexChange: (callback) => {
			onIndexChange = callback;
		}
	};
}

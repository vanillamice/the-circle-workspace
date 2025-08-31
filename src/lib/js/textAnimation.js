export function createTextAnimation(element, options = {}) {
	if (!element) return null;

	const { threshold = 0.3, rootMargin = '0px 0px -50px 0px', fallbackDelay = null } = options;

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('animate');
				}
			});
		},
		{
			threshold,
			rootMargin
		}
	);

	observer.observe(element);

	// Fallback animation
	let fallbackTimeout;
	if (fallbackDelay) {
		fallbackTimeout = setTimeout(() => {
			if (!element.classList.contains('animate')) {
				element.classList.add('animate');
			}
		}, fallbackDelay);
	}

	return {
		destroy() {
			observer.disconnect();
			if (fallbackTimeout) {
				clearTimeout(fallbackTimeout);
			}
		}
	};
}

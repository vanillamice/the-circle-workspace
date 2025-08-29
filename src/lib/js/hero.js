// src/lib/hero.js
export function createSlider(track, { interval = 4000 } = {}) {
	let slides = Array.from(track.children);
	let total = slides.length;

	// clone first + last
	const firstClone = slides[0].cloneNode(true);
	const lastClone = slides[slides.length - 1].cloneNode(true);
	track.appendChild(firstClone);
	track.insertBefore(lastClone, slides[0]);

	// recalc slides
	slides = Array.from(track.children);
	total = slides.length;

	let index = 1; // start on first real slide
	let timer;
	let isPaused = false;

	function setTransform(i, withTransition = true) {
		track.style.transition = withTransition ? 'transform 500ms ease' : 'none';
		track.style.transform = `translateX(${-i * 100}%)`;
	}

	function next() {
		index++;
		setTransform(index);

		if (index === total - 1) {
			// jumped past last clone → snap back
			setTimeout(() => {
				index = 1;
				setTransform(index, false);
			}, 500);
		}
	}

	function prev() {
		index--;
		setTransform(index);

		if (index === 0) {
			// jumped past first clone → snap to real last
			setTimeout(() => {
				index = total - 2;
				setTransform(index, false);
			}, 500);
		}
	}

	function start() {
		if (!isPaused) {
			timer = setInterval(next, interval);
		}
	}

	function stop() {
		clearInterval(timer);
		timer = null;
	}

	function pause() {
		isPaused = true;
		stop();
	}

	function resume() {
		isPaused = false;
		start();
	}

	// init
	setTransform(index, false);
	start();

	return {
		next,
		prev,
		pause,
		resume,
		destroy: stop
	};
}

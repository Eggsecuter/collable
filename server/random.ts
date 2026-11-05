// deterministic random numbers between 0 and 1 (mulberry32)
export const seededRandom = (seed: number) => {
	let state = seed | 0;

	return () => {
		state = state + 0x6d2b79f5 | 0;

		let value = Math.imul(state ^ state >>> 15, 1 | state);
		value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;

		return ((value ^ value >>> 14) >>> 0) / 4294967296;
	};
};

// random seeds stored in integer columns
export const createSeed = () => Math.floor(Math.random() * 2147483647);

// shuffles a copy of the items, always in the same order for the same seed
export const seededShuffle = <T>(items: T[], seed: number) => {
	const random = seededRandom(seed);
	const shuffled = [...items];

	for (let index = shuffled.length - 1; index > 0; index--) {
		const swapIndex = Math.floor(random() * (index + 1));

		[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
	}

	return shuffled;
};

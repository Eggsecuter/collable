// levenshtein distance between the query and the closest prefix of the text, so unfinished names still match
// gives up early once every path exceeds the allowed distance
export const prefixLevenshteinDistance = (query: string, text: string, allowedDistance: number) => {
	const columns = Math.min(text.length, query.length + allowedDistance);

	let previous = new Array<number>(columns + 1);
	let current = new Array<number>(columns + 1);

	for (let column = 0; column <= columns; column++) {
		previous[column] = column;
	}

	for (let row = 1; row <= query.length; row++) {
		current[0] = row;
		let rowMinimum = row;

		for (let column = 1; column <= columns; column++) {
			const substitution = previous[column - 1] + (query[row - 1] == text[column - 1] ? 0 : 1);

			current[column] = Math.min(substitution, previous[column] + 1, current[column - 1] + 1);
			rowMinimum = Math.min(rowMinimum, current[column]);
		}

		if (rowMinimum > allowedDistance) {
			return Infinity;
		}

		[previous, current] = [current, previous];
	}

	return Math.min(...previous);
};

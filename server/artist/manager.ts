import { Manager } from "vlserver";
import { Artist, DbContext } from "../managed/database";
import { prefixLevenshteinDistance } from "../levenshtein";

type SearchEntry = {
	artist: Artist;

	// normalized name and the same name starting at each later word
	starts: string[];
};

const minimumSearchLength = 2;

// the artist table does not change at runtime, load it once and search in memory
// kept outside of the class, esbuild renames classes referencing themselves which breaks vlservers injection by name
let searchEntries: Promise<SearchEntry[]>;

export class ArtistManager extends Manager {
	constructor(
		private database: DbContext
	) {
		super();
	}

	async search(query: string, limit: number) {
		query = this.normalize(query);

		// single letters match too many artists to be useful
		if (query.length < minimumSearchLength) {
			return [];
		}

		const allowedDistance = this.allowedDistance(query);
		const matches: { artist: Artist, distance: number }[] = [];

		// levenshtein cannot be expressed in a query, compare every artist
		for (let entry of await this.loadSearchEntries()) {
			let distance = Infinity;

			for (let start of entry.starts) {
				distance = Math.min(distance, prefixLevenshteinDistance(query, start, allowedDistance));
			}

			if (distance <= allowedDistance) {
				matches.push({ artist: entry.artist, distance });
			}
		}

		// artists are sorted by popularity, the stable sort keeps popular artists first within the same distance
		return matches
			.sort((a, b) => a.distance - b.distance)
			.slice(0, limit)
			.map(match => match.artist);
	}

	// compare names without casing or accents, so 'beyonce' matches 'Beyoncé'
	normalize(name: string) {
		return name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
	}

	// longer queries allow more typos
	private allowedDistance(query: string) {
		if (query.length <= 3) {
			return 0;
		}

		if (query.length <= 6) {
			return 1;
		}

		return query.length <= 10 ? 2 : 3;
	}

	private loadSearchEntries() {
		if (!searchEntries) {
			searchEntries = this.database.artist
				.orderByDescending(artist => artist.popularity)
				.toArray()
				.then(artists => artists.map(artist => ({
					artist,
					starts: this.wordStarts(this.normalize(artist.name))
				})));

			searchEntries.catch(() => searchEntries = null);
		}

		return searchEntries;
	}

	// the name and the same name starting at each later word, so 'sheeran' finds 'Ed Sheeran'
	private wordStarts(name: string) {
		const starts = [name];

		for (let index = 1; index < name.length; index++) {
			if (name[index - 1] == ' ' && name[index] != ' ') {
				starts.push(name.substring(index));
			}
		}

		return starts;
	}
}

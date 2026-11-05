import { QueryUUID } from "vlquery";
import { Manager } from "vlserver";
import { Artist, DailyArtist, DbContext } from "../managed/database";
import { createSeed, seededShuffle } from "../random";

// daily artist selection rules, see readme
const minimumFollowers = 1000000;
const minimumCollaborators = 5;
const candidatePoolSize = 100;

const maximumCollaborators = 10;

// share of the name revealed per number of wrong guesses
// null shows nothing, 0 shows the outline of the name without any letters
const revealedShares = [null, 0, 0.2, 0.4, 0.6, 0.8];

export type GuessResult = 'correct' | 'collaborator' | 'wrong';

export class QuizManager extends Manager {
	constructor(
		private database: DbContext
	) {
		super();
	}

	// days start at midnight utc
	getToday() {
		return new Date().toISOString().split('T')[0];
	}

	async getArtist(day: string) {
		return await (await this.getDailyArtist(day)).artist.fetch();
	}

	// the pick of the day, picks a new artist on the first request of the day
	async getDailyArtist(day: string) {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || day > this.getToday()) {
			throw new Error(`Invalid day '${day}'`);
		}

		const existing = await this.findDailyArtist(day);

		if (existing) {
			return existing;
		}

		// past days without a pick cannot be played
		if (day != this.getToday()) {
			throw new Error(`No artist was picked on '${day}'`);
		}

		const dailyArtist = new DailyArtist();
		dailyArtist.day = new Date(day);
		dailyArtist.artistId = (await this.pick()).id;
		dailyArtist.hintSeed = createSeed();

		try {
			return await dailyArtist.create();
		} catch (error) {
			// another request picked at the same time, the day is unique so use their pick
			const concurrent = await this.findDailyArtist(day);

			if (concurrent) {
				return concurrent;
			}

			throw error;
		}
	}

	// the most followed collaborators of the days artist
	async getCollaborators(day: string) {
		const artist = await this.getArtist(day);

		const collaborators = await this.findCollaborators([artist.id]);
		const ids = [...collaborators.get(artist.id) ?? []];

		// postgres sorts missing follower counts first, the few artists without them are obscure anyways
		// the id makes the order unique, so every player sees the same graph
		return this.database.artist
			.where(collaborator => (collaborator.id as QueryUUID).includedIn(ids) && collaborator.followers.valueOf() != null)
			.orderByDescending(collaborator => collaborator.followers)
			.orderByDescending(collaborator => collaborator.popularity)
			.orderByAscending(collaborator => collaborator.id)
			.limit(maximumCollaborators);
	}

	// 'correct' for the days artist, 'collaborator' for anyone who collaborated with them, 'wrong' otherwise
	async guess(day: string, artistId: string): Promise<GuessResult> {
		const artist = await this.getArtist(day);
		const guess = await this.database.artist.find(artistId);

		// some artists exist multiple times with the same name
		if (guess.id == artist.id || guess.name.toLowerCase() == artist.name.toLowerCase()) {
			return 'correct';
		}

		const collaborators = await this.findCollaborators([artist.id]);

		if (collaborators.get(artist.id)?.has(guess.id)) {
			return 'collaborator';
		}

		return 'wrong';
	}

	// the days artist name with unrevealed letters as null, empty while there is no hint yet
	// masked on the server, so the full name is never sent while the quiz is running
	async getHint(day: string, wrongGuesses: number) {
		const dailyArtist = await this.getDailyArtist(day);
		const artist = await dailyArtist.artist.fetch();

		// the client sends the guess count, cap it so the hint never gives away more than the last share
		const guesses = Math.max(0, Math.min(revealedShares.length - 1, Math.floor(+wrongGuesses) || 0));
		const share = revealedShares[guesses];

		if (share === null) {
			return [];
		}

		const characters = [...artist.name];

		// spaces and punctuation are always visible
		const letterIndices = characters
			.map((_, index) => index)
			.filter(index => /[\p{L}\p{N}]/u.test(characters[index]));

		// at least one letter stays hidden, short names would be given away otherwise
		const revealedCount = Math.min(Math.ceil(letterIndices.length * share), letterIndices.length - 1);

		// the same order for every request, so each wrong guess adds letters to the previously revealed ones
		const revealed = new Set(seededShuffle(letterIndices, dailyArtist.hintSeed).slice(0, revealedCount));

		return characters.map((character, index) => letterIndices.includes(index) && !revealed.has(index) ? null : character);
	}

	private findDailyArtist(day: string) {
		return this.database.dailyArtist.first(dailyArtist => dailyArtist.day.toISODate().valueOf() == day);
	}

	private async pick() {
		const picked = (await this.database.dailyArtist.toArray()).map(dailyArtist => dailyArtist.artistId);

		const candidates = (await this.database.artist
			.where(artist => artist.followers.valueOf() >= minimumFollowers && artist.chartHits.valueOf() != null && artist.chartHits.valueOf() != '' && artist.chartHits.valueOf() != '[]')
			.orderByDescending(artist => artist.popularity)
			.toArray()
		).filter(artist => !picked.includes(artist.id));

		// check the collaborations in batches until the pool is full, most candidates will pass
		const pool: Artist[] = [];

		for (let offset = 0; offset < candidates.length && pool.length < candidatePoolSize; offset += candidatePoolSize) {
			const batch = candidates.slice(offset, offset + candidatePoolSize);
			const collaborators = await this.findCollaborators(batch.map(artist => artist.id));

			for (let artist of batch) {
				if (pool.length < candidatePoolSize && collaborators.get(artist.id)?.size >= minimumCollaborators) {
					pool.push(artist);
				}
			}
		}

		if (!pool.length) {
			throw new Error('No artists left to pick');
		}

		return pool[Math.floor(Math.random() * pool.length)];
	}

	// collaborations are stored in one direction only, check both and count every collaborator once
	private async findCollaborators(artistIds: string[]) {
		const collaborations = await this.database.collaboration
			.where(collaboration => collaboration.fromArtistId.includedIn(artistIds) || collaboration.toArtistId.includedIn(artistIds))
			.toArray();

		const collaborators = new Map<string, Set<string>>();

		const add = (artistId: string, collaboratorId: string) => {
			if (!collaborators.has(artistId)) {
				collaborators.set(artistId, new Set());
			}

			collaborators.get(artistId).add(collaboratorId);
		};

		for (let collaboration of collaborations) {
			// skip collaborators which are not in the artist table
			if (collaboration.fromArtistId && collaboration.toArtistId && collaboration.fromArtistId != collaboration.toArtistId) {
				add(collaboration.fromArtistId, collaboration.toArtistId);
				add(collaboration.toArtistId, collaboration.fromArtistId);
			}
		}

		return collaborators;
	}
}

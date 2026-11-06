import { QueryUUID } from "vlquery";
import { Manager } from "vlserver";
import { Artist, DailyArtist, DailyArtistCollaborator, DbContext, Guess } from "../managed/database";
import { PlayerContext } from "../player/context";
import { createSeed, seededShuffle } from "../random";

// daily artist selection rules, see readme
const minimumFollowers = 1000000;
const minimumCollaborators = 5;
const candidatePoolSize = 100;

const maximumCollaborators = 10;
const maximumGuesses = 6;

// share of the song count in the collaborator order, the rest is popularity
const countWeight = 0.5;

// share of the name revealed per number of wrong guesses
// null shows nothing, 0 shows the outline of the name without any letters
const revealedShares = [null, 0, 0.2, 0.4, 0.6, 0.8];

export type GuessResult = 'correct' | 'collaborator' | 'wrong';

export class QuizManager extends Manager {
	constructor(
		private database: DbContext,
		private player: PlayerContext
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

	// the collaborators shown in the graph of the day
	// calculated on the first request of the day and stored, every later request reads the stored graph
	async getCollaborators(day: string) {
		const dailyArtist = await this.getDailyArtist(day);
		const stored = await this.findStoredCollaborators(dailyArtist.id);

		if (stored.length) {
			return stored;
		}

		await this.storeCollaborators(dailyArtist.id, await this.calculateCollaborators(await dailyArtist.artist.fetch()));

		return await this.findStoredCollaborators(dailyArtist.id);
	}

	// the players guesses of the day in the order they were made
	async getGuesses(day: string) {
		const dailyArtistId = (await this.getDailyArtist(day)).id;
		const playerId = this.player.id;

		return this.database.guess
			.where(guess => guess.playerId.valueOf() == playerId && guess.dailyArtistId.valueOf() == dailyArtistId)
			.orderByAscending(guess => guess.guessed)
			.toArray();
	}

	// every day an artist was picked on, newest first
	// days are only picked when someone plays, so days without players are missing
	async getArchiveDays() {
		const today = this.getToday();

		return (await this.database.dailyArtist
			.orderByDescending(dailyArtist => dailyArtist.day)
			.toArray()
		).filter(dailyArtist => dailyArtist.day.toISOString().split('T')[0] <= today);
	}

	// the players guesses of all days, the archive shows the result of each day
	async getArchiveGuesses() {
		const playerId = this.player.id;

		return this.database.guess
			.where(guess => guess.playerId.valueOf() == playerId)
			.orderByAscending(guess => guess.guessed)
			.toArray();
	}

	// stores the guess of the player, checked against the days artist
	async guess(day: string, artistId: string) {
		const dailyArtist = await this.getDailyArtist(day);
		const artist = await dailyArtist.artist.fetch();
		const guessed = await this.database.artist.find(artistId);

		const previousGuesses = await this.getGuesses(day);

		if (this.isFinished(previousGuesses)) {
			throw new Error(`The quiz of '${day}' is finished already`);
		}

		if (previousGuesses.some(previous => previous.artistId == guessed.id)) {
			throw new Error(`'${guessed.name}' was guessed already`);
		}

		const guess = new Guess();
		guess.playerId = this.player.id;
		guess.guessed = new Date();
		guess.dailyArtistId = dailyArtist.id;
		guess.artistId = guessed.id;

		const collaborators = (await this.findCollaborators([artist.id])).get(artist.id);
		guess.result = this.check(artist, guessed, collaborators);

		// collaborators join the graph between two random neighbours, stored so the graph looks the same on the next visit
		if (guess.result == 'collaborator') {
			guess.collaborationCount = collaborators.get(guessed.id);

			const shownCollaborators = (await this.getCollaborators(day)).length + previousGuesses.filter(previous => previous.result == 'collaborator').length;

			guess.graphIndex = 1 + Math.floor(Math.random() * shownCollaborators);
		}

		return await guess.create();
	}

	// how many players needed how many guesses, the last entry counts the players who did not find the artist
	// players who are still guessing are left out, the player themselves is included once they are done
	async getStatistics(day: string) {
		const dailyArtistId = (await this.getDailyArtist(day)).id;

		const guesses = await this.database.guess
			.where(guess => guess.dailyArtistId.valueOf() == dailyArtistId)
			.toArray();

		const players = new Map<string, Guess[]>();

		for (let guess of guesses) {
			if (!players.has(guess.playerId)) {
				players.set(guess.playerId, []);
			}

			players.get(guess.playerId).push(guess);
		}

		const counts = new Array(maximumGuesses + 1).fill(0);

		for (let playerGuesses of players.values()) {
			if (playerGuesses.some(guess => guess.result == 'correct')) {
				// the quiz ends with the correct guess, so it is always the last one
				counts[playerGuesses.length - 1]++;
			} else if (playerGuesses.length >= maximumGuesses) {
				counts[maximumGuesses]++;
			}
		}

		return counts;
	}

	// the full name is only sent once the player is done, until then only the hint is available
	async getSolution(day: string) {
		if (!this.isFinished(await this.getGuesses(day))) {
			throw new Error(`The quiz of '${day}' is not finished yet`);
		}

		return await this.getArtist(day);
	}

	// the days artist name with unrevealed letters as null, empty while there is no hint yet
	// masked on the server, so the full name is never sent while the quiz is running
	async getHint(day: string) {
		const dailyArtist = await this.getDailyArtist(day);
		const artist = await dailyArtist.artist.fetch();

		// the last share stays after more wrong guesses, so the hint never gives away the whole name
		const wrongGuesses = (await this.getGuesses(day)).filter(guess => guess.result != 'correct').length;
		const share = revealedShares[Math.min(revealedShares.length - 1, wrongGuesses)];

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

	// 'correct' for the days artist, 'collaborator' for anyone who collaborated with them, 'wrong' otherwise
	private check(artist: Artist, guessed: Artist, collaborators: Map<string, number>): GuessResult {
		// some artists exist multiple times with the same name
		if (guessed.id == artist.id || guessed.name.toLowerCase() == artist.name.toLowerCase()) {
			return 'correct';
		}

		if (collaborators?.has(guessed.id)) {
			return 'collaborator';
		}

		return 'wrong';
	}

	private isFinished(guesses: Guess[]) {
		return guesses.some(guess => guess.result == 'correct') || guesses.length >= maximumGuesses;
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

	// the collaborators of the artist with the most songs together, with the number of songs
	private async calculateCollaborators(artist: Artist) {
		const collaborators = await this.findCollaborators([artist.id]);
		const counts = collaborators.get(artist.id) ?? new Map<string, number>();

		// the few artists without follower counts are obscure anyways
		const candidates = await this.database.artist
			.where(collaborator => (collaborator.id as QueryUUID).includedIn([...counts.keys()]) && collaborator.followers.valueOf() != null)
			.toArray();

		// counts range from 1 to thousands, the logarithm keeps a few close collaborators from outweighing popularity
		// both parts are relative to the best collaborator, so each weighs the same for every artist
		const maximumCount = Math.max(1, ...candidates.map(candidate => counts.get(candidate.id)));
		const maximumPopularity = Math.max(1, ...candidates.map(candidate => candidate.popularity ?? 0));

		const score = (collaborator: Artist) =>
			countWeight * Math.log(1 + counts.get(collaborator.id)) / Math.log(1 + maximumCount)
			+ (1 - countWeight) * (collaborator.popularity ?? 0) / maximumPopularity;

		// the id makes the order unique, so every player sees the same graph
		return candidates
			.map(collaborator => ({ collaborator, score: score(collaborator) }))
			.sort((a, b) => b.score - a.score || (a.collaborator.id < b.collaborator.id ? -1 : 1))
			.slice(0, maximumCollaborators)
			.map(scored => ({ artist: scored.collaborator, count: counts.get(scored.collaborator.id) }));
	}

	private findStoredCollaborators(dailyArtistId: string) {
		return this.database.dailyArtistCollaborator
			.where(collaborator => collaborator.dailyArtistId.valueOf() == dailyArtistId)
			.orderByAscending(collaborator => collaborator.rank)
			.include(collaborator => collaborator.artist)
			.toArray();
	}

	// a concurrent first request calculates the same graph, rows failing on the unique constraint were stored by that request
	private async storeCollaborators(dailyArtistId: string, collaborators: { artist: Artist, count: number }[]) {
		await Promise.allSettled(collaborators.map(({ artist, count }, rank) => {
			const collaborator = new DailyArtistCollaborator();
			collaborator.dailyArtistId = dailyArtistId;
			collaborator.artistId = artist.id;
			collaborator.count = count;
			collaborator.rank = rank;

			return collaborator.create();
		}));
	}

	// collaborations are stored in one direction only, check both and count every collaborator once
	// maps each artist to their collaborators and the number of songs they made together
	private async findCollaborators(artistIds: string[]) {
		const collaborations = await this.database.collaboration
			.where(collaboration => collaboration.fromArtistId.includedIn(artistIds) || collaboration.toArtistId.includedIn(artistIds))
			.toArray();

		const collaborators = new Map<string, Map<string, number>>();

		const add = (artistId: string, collaboratorId: string, count: number) => {
			if (!collaborators.has(artistId)) {
				collaborators.set(artistId, new Map());
			}

			const counts = collaborators.get(artistId);
			counts.set(collaboratorId, (counts.get(collaboratorId) ?? 0) + count);
		};

		for (let collaboration of collaborations) {
			// skip collaborators which are not in the artist table
			if (collaboration.fromArtistId && collaboration.toArtistId && collaboration.fromArtistId != collaboration.toArtistId) {
				add(collaboration.fromArtistId, collaboration.toArtistId, collaboration.count);
				add(collaboration.toArtistId, collaboration.fromArtistId, collaboration.count);
			}
		}

		return collaborators;
	}
}

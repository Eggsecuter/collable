import { Service } from "vlserver";
import { ArtistViewModel } from "../artist/model";
import { QuizManager } from "./manager";
import { ArchiveDayViewModel, ArchiveGuessViewModel, CollaboratorViewModel, GuessViewModel } from "./model";

export class QuizService extends Service {
	constructor(
		private manager: QuizManager
	) {
		super();
	}

	// the client keeps the day, so a quiz started before midnight is still checked against the same artist
	getDay() {
		return this.manager.getToday();
	}

	async getArchiveDays() {
		return ArchiveDayViewModel.from(await this.manager.getArchiveDays());
	}

	async getArchiveGuesses() {
		return ArchiveGuessViewModel.from(await this.manager.getArchiveGuesses());
	}

	async getCollaborators(day: string) {
		return CollaboratorViewModel.from(await this.manager.getCollaborators(day));
	}

	// the guesses of the player identified by their cookie
	async getGuesses(day: string) {
		return GuessViewModel.from(await this.manager.getGuesses(day));
	}

	async guess(day: string, artistId: string) {
		return new GuessViewModel(await this.manager.guess(day, artistId));
	}

	async getHint(day: string): Promise<string[]> {
		return await this.manager.getHint(day);
	}

	async getSolution(day: string) {
		return new ArtistViewModel(await this.manager.getSolution(day));
	}
}

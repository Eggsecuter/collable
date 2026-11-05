import { Service } from "vlserver";
import { ArtistViewModel } from "../artist/model";
import { QuizManager } from "./manager";

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

	async getCollaborators(day: string) {
		return ArtistViewModel.from(await this.manager.getCollaborators(day));
	}

	// returns 'correct', 'collaborator' or 'wrong'
	async guess(day: string, artistId: string): Promise<string> {
		return await this.manager.guess(day, artistId);
	}

	async getHint(day: string, wrongGuesses: number): Promise<string[]> {
		return await this.manager.getHint(day, wrongGuesses);
	}

	async getSolution(day: string) {
		return new ArtistViewModel(await this.manager.getArtist(day));
	}
}

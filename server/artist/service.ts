import { Service } from "vlserver";
import { ArtistManager } from "./manager";
import { ArtistViewModel } from "./model";

const maximumSearchResults = 5;

export class ArtistService extends Service {
	constructor(
		private manager: ArtistManager
	) {
		super();
	}

	async search(query: string) {
		return ArtistViewModel.from(await this.manager.search(query, maximumSearchResults));
	}
}

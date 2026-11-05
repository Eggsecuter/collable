import { ViewModel } from "vlserver";
import { ArtistViewModel } from "../artist/model";
import { Guess } from "../managed/database";

export class GuessViewModel extends ViewModel<Guess> {
	id;

	// 'correct', 'collaborator' or 'wrong'
	result;
	graphIndex;

	artist: ArtistViewModel;
}

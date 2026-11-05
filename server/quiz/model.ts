import { ViewModel } from "vlserver";
import { ArtistViewModel } from "../artist/model";
import { DailyArtist, Guess } from "../managed/database";

export class GuessViewModel extends ViewModel<Guess> {
	id;

	// 'correct', 'collaborator' or 'wrong'
	result;
	graphIndex;

	artist: ArtistViewModel;
}

export class ArchiveDayViewModel extends ViewModel<DailyArtist> {
	id;

	day;
}

export class ArchiveGuessViewModel extends ViewModel<Guess> {
	id;

	// 'correct', 'collaborator' or 'wrong'
	result;

	dailyArtistId;
}

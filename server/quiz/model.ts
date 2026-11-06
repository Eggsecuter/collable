import { ViewModel } from "vlserver";
import { ArtistViewModel } from "../artist/model";
import { DailyArtist, DailyArtistCollaborator, Guess } from "../managed/database";

export class GuessViewModel extends ViewModel<Guess> {
	id;

	// 'correct', 'collaborator' or 'wrong'
	result;
	graphIndex;

	// songs made with the daily artist, only set for collaborators
	collaborationCount;

	artist: ArtistViewModel;
}

export class CollaboratorViewModel extends ViewModel<DailyArtistCollaborator> {
	id;

	// songs made with the daily artist
	count;

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

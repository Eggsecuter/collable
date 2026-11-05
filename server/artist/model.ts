import { ViewModel } from "vlserver";
import { Artist } from "../managed/database";

export class ArtistViewModel extends ViewModel<Artist> {
	id;

	name;
}

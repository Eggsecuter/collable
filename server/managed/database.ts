import { Entity, DbSet, RunContext, QueryUUID, QueryProxy, QueryString, QueryJSON, QueryTimeStamp, QueryNumber, QueryTime, QueryDate, QueryBoolean, QueryBuffer, QueryEnum, ForeignReference, PrimaryReference, View, ViewSet } from 'vlquery';

export class ArtistQueryProxy extends QueryProxy {
	get chartHits(): Partial<QueryString> { throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime"); }
	get followers(): Partial<QueryNumber> { throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime"); }
	get genres(): Partial<QueryString> { throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime"); }
	get name(): Partial<QueryString> { throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime"); }
	get popularity(): Partial<QueryNumber> { throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime"); }
	get spotifyId(): Partial<QueryString> { throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime"); }
}

export class Artist extends Entity<ArtistQueryProxy> {
	dailyArtists: PrimaryReference<DailyArtist, DailyArtistQueryProxy>;
		fromCollaborations: PrimaryReference<Collaboration, CollaborationQueryProxy>;
		toCollaborations: PrimaryReference<Collaboration, CollaborationQueryProxy>;
		chartHits: string;
	followers: number;
	genres: string;
	declare id: string;
	name: string;
	popularity: number;
	spotifyId: string;

	$$meta = {
		source: "artist",
		columns: {
			chartHits: { type: "text", name: "chart_hits" },
			followers: { type: "int4", name: "followers" },
			genres: { type: "text", name: "genres" },
			id: { type: "uuid", name: "id" },
			name: { type: "text", name: "name" },
			popularity: { type: "int4", name: "popularity" },
			spotifyId: { type: "text", name: "spotify_id" }
		},
		get set(): DbSet<Artist, ArtistQueryProxy> {
			return new DbSet<Artist, ArtistQueryProxy>(Artist, null);
		}
	};

	constructor() {
		super();

		this.dailyArtists = new PrimaryReference<DailyArtist, DailyArtistQueryProxy>(this, "artistId", DailyArtist);
		this.fromCollaborations = new PrimaryReference<Collaboration, CollaborationQueryProxy>(this, "fromArtistId", Collaboration);
		this.toCollaborations = new PrimaryReference<Collaboration, CollaborationQueryProxy>(this, "toArtistId", Collaboration);
	}
}
			
export class CollaborationQueryProxy extends QueryProxy {
	get fromArtist(): Partial<ArtistQueryProxy> { throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime"); }
	get toArtist(): Partial<ArtistQueryProxy> { throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime"); }
	get fromArtistId(): Partial<QueryUUID> { throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime"); }
	get spotifyFromId(): Partial<QueryString> { throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime"); }
	get spotifyToId(): Partial<QueryString> { throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime"); }
	get toArtistId(): Partial<QueryUUID> { throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime"); }
}

export class Collaboration extends Entity<CollaborationQueryProxy> {
	get fromArtist(): Partial<ForeignReference<Artist>> { return this.$fromArtist; }
	get toArtist(): Partial<ForeignReference<Artist>> { return this.$toArtist; }
	fromArtistId: string;
	declare id: string;
	spotifyFromId: string;
	spotifyToId: string;
	toArtistId: string;

	$$meta = {
		source: "collaboration",
		columns: {
			fromArtistId: { type: "uuid", name: "from_artist_id" },
			id: { type: "uuid", name: "id" },
			spotifyFromId: { type: "text", name: "spotify_from_id" },
			spotifyToId: { type: "text", name: "spotify_to_id" },
			toArtistId: { type: "uuid", name: "to_artist_id" }
		},
		get set(): DbSet<Collaboration, CollaborationQueryProxy> {
			return new DbSet<Collaboration, CollaborationQueryProxy>(Collaboration, null);
		}
	};

	constructor() {
		super();

		this.$fromArtist = new ForeignReference<Artist>(this, "fromArtistId", Artist);
	this.$toArtist = new ForeignReference<Artist>(this, "toArtistId", Artist);
	}

	private $fromArtist: ForeignReference<Artist>;

	set fromArtist(value: Partial<ForeignReference<Artist>>) {
		if (value) {
			if (!value.id) { throw new Error("Invalid null id. Save the referenced model prior to creating a reference to it."); }

			this.fromArtistId = value.id as string;
		} else {
			this.fromArtistId = null;
		}
	}

	private $toArtist: ForeignReference<Artist>;

	set toArtist(value: Partial<ForeignReference<Artist>>) {
		if (value) {
			if (!value.id) { throw new Error("Invalid null id. Save the referenced model prior to creating a reference to it."); }

			this.toArtistId = value.id as string;
		} else {
			this.toArtistId = null;
		}
	}

	
}
			
export class DailyArtistQueryProxy extends QueryProxy {
	get artist(): Partial<ArtistQueryProxy> { throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime"); }
	get artistId(): Partial<QueryUUID> { throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime"); }
	get day(): Partial<QueryDate> { throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime"); }
	get hintSeed(): Partial<QueryNumber> { throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime"); }
}

export class DailyArtist extends Entity<DailyArtistQueryProxy> {
	get artist(): Partial<ForeignReference<Artist>> { return this.$artist; }
	artistId: string;
	day: Date;
	hintSeed: number;
	declare id: string;

	$$meta = {
		source: "daily_artist",
		columns: {
			artistId: { type: "uuid", name: "artist_id" },
			day: { type: "date", name: "day" },
			hintSeed: { type: "int4", name: "hint_seed" },
			id: { type: "uuid", name: "id" }
		},
		get set(): DbSet<DailyArtist, DailyArtistQueryProxy> {
			return new DbSet<DailyArtist, DailyArtistQueryProxy>(DailyArtist, null);
		}
	};

	constructor() {
		super();

		this.$artist = new ForeignReference<Artist>(this, "artistId", Artist);
	}

	private $artist: ForeignReference<Artist>;

	set artist(value: Partial<ForeignReference<Artist>>) {
		if (value) {
			if (!value.id) { throw new Error("Invalid null id. Save the referenced model prior to creating a reference to it."); }

			this.artistId = value.id as string;
		} else {
			this.artistId = null;
		}
	}

	
}
			

export class DbContext {
	artist: DbSet<Artist, ArtistQueryProxy>;
	collaboration: DbSet<Collaboration, CollaborationQueryProxy>;
	dailyArtist: DbSet<DailyArtist, DailyArtistQueryProxy>;

	constructor(private runContext: RunContext) {
		this.artist = new DbSet<Artist, ArtistQueryProxy>(Artist, this.runContext);
		this.collaboration = new DbSet<Collaboration, CollaborationQueryProxy>(Collaboration, this.runContext);
		this.dailyArtist = new DbSet<DailyArtist, DailyArtistQueryProxy>(DailyArtist, this.runContext);
	}

	findSet(modelType) {
		for (let key in this) {
			if (this[key] instanceof DbSet) {
				if ((this[key] as any).modelConstructor == modelType) {
					return this[key];
				}
			}
		}
	}

	
};
CREATE TABLE artist (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

	spotify_id TEXT NOT NULL,

	name TEXT NOT NULL,
	followers INTEGER,
	popularity INTEGER,
	genres TEXT,
	chart_hits TEXT
);

CREATE TABLE collaboration (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

	spotify_from_id TEXT NOT NULL,
	spotify_to_id TEXT NOT NULL,

	from_artist_id UUID CONSTRAINT from_artist__from_collaborations REFERENCES artist (id),
	to_artist_id UUID CONSTRAINT to_artist__to_collaborations REFERENCES artist (id)
);

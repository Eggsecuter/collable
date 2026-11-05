CREATE TABLE daily_artist (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

	day DATE NOT NULL UNIQUE,

	artist_id UUID NOT NULL CONSTRAINT artist__daily_artists REFERENCES artist (id)
);

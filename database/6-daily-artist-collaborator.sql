-- collaborations are looked up from both sides
CREATE INDEX collaboration_from_artist_id ON collaboration (from_artist_id);
CREATE INDEX collaboration_to_artist_id ON collaboration (to_artist_id);

-- collaborators shown in the graph of the day, calculated on the first request of the day
CREATE TABLE daily_artist_collaborator (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

	daily_artist_id UUID NOT NULL CONSTRAINT daily_artist__collaborators REFERENCES daily_artist (id),
	artist_id UUID NOT NULL CONSTRAINT artist__daily_artist_collaborators REFERENCES artist (id),

	-- position in the graph, starting at 0
	rank INTEGER NOT NULL,

	UNIQUE (daily_artist_id, artist_id)
);

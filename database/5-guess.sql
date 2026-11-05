-- guesses of the players, identified by the uuid in their cookie
CREATE TABLE guess (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

	player_id UUID NOT NULL,
	guessed TIMESTAMP NOT NULL DEFAULT now(),

	daily_artist_id UUID NOT NULL CONSTRAINT daily_artist__guesses REFERENCES daily_artist (id),
	artist_id UUID NOT NULL CONSTRAINT artist__guesses REFERENCES artist (id),

	-- 'correct', 'collaborator' or 'wrong'
	result TEXT NOT NULL,

	-- position of a collaborator in the graph
	graph_index INTEGER,

	UNIQUE (player_id, daily_artist_id, artist_id)
);

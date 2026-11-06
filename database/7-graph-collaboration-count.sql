-- number of songs the collaborators in the graph made with the daily artist, shown on the lines of the graph
ALTER TABLE daily_artist_collaborator ADD COLUMN count INTEGER;
ALTER TABLE guess ADD COLUMN collaboration_count INTEGER;

-- collaborations are stored in one direction only, both directions are summed
UPDATE daily_artist_collaborator SET count = (
	SELECT coalesce(sum(collaboration.count), 1)
	FROM collaboration, daily_artist
	WHERE daily_artist.id = daily_artist_collaborator.daily_artist_id AND (
		(collaboration.from_artist_id = daily_artist.artist_id AND collaboration.to_artist_id = daily_artist_collaborator.artist_id)
		OR (collaboration.to_artist_id = daily_artist.artist_id AND collaboration.from_artist_id = daily_artist_collaborator.artist_id)
	)
);

ALTER TABLE daily_artist_collaborator ALTER COLUMN count SET NOT NULL;

-- only set for collaborators
UPDATE guess SET collaboration_count = (
	SELECT coalesce(sum(collaboration.count), 1)
	FROM collaboration, daily_artist
	WHERE daily_artist.id = guess.daily_artist_id AND (
		(collaboration.from_artist_id = daily_artist.artist_id AND collaboration.to_artist_id = guess.artist_id)
		OR (collaboration.to_artist_id = daily_artist.artist_id AND collaboration.from_artist_id = guess.artist_id)
	)
) WHERE result = 'collaborator';

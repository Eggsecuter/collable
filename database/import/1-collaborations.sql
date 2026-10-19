UPDATE collaboration c
SET
	from_artist_id = a_from.id,
	to_artist_id   = a_to.id
FROM artist a_from,
	artist a_to
WHERE a_from.spotify_id = c.spotify_from_id
	AND a_to.spotify_id = c.spotify_to_id;

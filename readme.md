# Collable
Daily quiz where you have to guess the artist by their collaboration network.

## Data
The data is imported from a [kaggle dataset](https://www.kaggle.com/datasets/jfreyberg/spotify-artist-feature-collaboration-network).

> Spotify Artist Feature Collaboration Network.
> A network-dataset covering features between leading global artists on spotify.

It covers spotify artists from all over the world until 10. Oct 2022.

## Choosing daily artist
- Exclude all artists
	- with no chart hits or under 1'000'000 followers
	- with less than 5 different collaborations
	- that were already picked
- Sort remaining by popularity and choose a random one of the top 100

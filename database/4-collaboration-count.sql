-- number of distinct songs two artists made together, see database/musicbrainz
ALTER TABLE collaboration ADD COLUMN count INTEGER NOT NULL DEFAULT 1;

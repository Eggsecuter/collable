ALTER TABLE daily_artist ADD COLUMN hint_seed INTEGER;

UPDATE daily_artist SET hint_seed = floor(random() * 2147483647);

ALTER TABLE daily_artist ALTER COLUMN hint_seed SET NOT NULL;

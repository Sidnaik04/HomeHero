-- Add latitude and longitude columns to providers table
ALTER TABLE providers
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Add spatial index for faster geo queries
CREATE INDEX idx_provider_coordinates ON providers(latitude, longitude);

-- Add comment
COMMENT ON COLUMN providers.latitude IS 'Provider latitude coordinate';
COMMENT ON COLUMN providers.longitude IS 'Provider longitude coordinate';

-- Update existing providers with Goa coordinates based on location
-- Panaji coordinates
UPDATE providers p
SET latitude = 15.4909, longitude = 73.8278
FROM users u
WHERE p.user_id = u.user_id AND u.location ILIKE '%panaji%' OR u.location ILIKE '%panjim%';

-- Margao coordinates
UPDATE providers p
SET latitude = 15.2832, longitude = 73.9667
FROM users u
WHERE p.user_id = u.user_id AND u.location ILIKE '%margao%' OR u.location ILIKE '%madgaon%';

-- Calangute coordinates
UPDATE providers p
SET latitude = 15.5439, longitude = 73.7553
FROM users u
WHERE p.user_id = u.user_id AND u.location ILIKE '%calangute%';

-- Mapusa coordinates
UPDATE providers p
SET latitude = 15.5911, longitude = 73.8077
FROM users u
WHERE p.user_id = u.user_id AND u.location ILIKE '%mapusa%';

-- Vasco da Gama coordinates
UPDATE providers p
SET latitude = 15.3989, longitude = 73.8151
FROM users u
WHERE p.user_id = u.user_id AND u.location ILIKE '%vasco%';

-- Baga coordinates
UPDATE providers p
SET latitude = 15.5560, longitude = 73.7516
FROM users u
WHERE p.user_id = u.user_id AND u.location ILIKE '%baga%';

-- Default coordinates (center of Goa) for any remaining NULL values
UPDATE providers
SET latitude = 15.2993, longitude = 74.1240
WHERE latitude IS NULL OR longitude IS NULL;
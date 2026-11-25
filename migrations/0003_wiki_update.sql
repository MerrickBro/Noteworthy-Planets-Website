-- --== New fields from the NMS wiki ==--
ALTER TABLE planets ADD COLUMN biome_type TEXT NOT NULL DEFAULT 'Unknown';
ALTER TABLE planets ADD COLUMN economy_type TEXT NOT NULL DEFAULT 'Unknown';

-- --== Renamed values ==--
UPDATE planets SET economy = 'Tier 1 (Weak)' WHERE economy = 'Economy Tier 1';
UPDATE planets SET economy = 'Tier 2 (Average)' WHERE economy = 'Economy Tier 2';
UPDATE planets SET economy = 'Tier 3 (Strong)' WHERE economy = 'Economy Tier 3';
UPDATE planets SET lifeform = 'Abandoned' WHERE economy = 'Abandoned';
UPDATE planets SET economy = 'None' WHERE economy = 'Abandoned';
UPDATE planets SET lifeform = 'Uncharted' WHERE lifeform = 'None';
UPDATE planets SET resource2 = 'Magnetised Ferrite' WHERE resource2 = 'Magnetized Ferrite';
UPDATE planets SET resource3 = 'Magnetised Ferrite' WHERE resource3 = 'Magnetized Ferrite';

-- --== Biome types for known descriptors ==--
UPDATE planets SET biome_type = 'Lush' WHERE biome IN ('Paradise', 'Rainy');
UPDATE planets SET biome_type = 'Volcanic' WHERE biome = 'Volcanic';
UPDATE planets SET biome_type = 'Marsh' WHERE biome = 'Quagmire';
UPDATE planets SET biome_type = 'Frozen' WHERE biome = 'Hiemal';
UPDATE planets SET biome_type = 'Toxic' WHERE biome = 'Contaminated';
UPDATE planets SET biome_type = 'Dead' WHERE biome = 'Lifeless';
UPDATE planets SET biome_type = 'Exotic' WHERE biome IN ('Of Light', 'Webbed', 'Skeletal', '[REDACTED]');

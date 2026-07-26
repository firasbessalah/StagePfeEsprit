-- Add raw_score and signals_json columns for the upgraded AI fraud detector
ALTER TABLE annonces ADD COLUMN IF NOT EXISTS raw_score DOUBLE PRECISION DEFAULT 0.0;
ALTER TABLE annonces ADD COLUMN IF NOT EXISTS signals_json TEXT;

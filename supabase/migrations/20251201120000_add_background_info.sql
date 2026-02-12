-- Add background_info column to assessments table
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS background_info jsonb DEFAULT '{}'::jsonb;

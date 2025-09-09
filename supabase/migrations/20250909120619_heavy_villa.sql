/*
  # Fix Database Schema Issues

  1. Add missing columns to assessments table
  2. Add missing columns to assessment_responses table
  3. Ensure all required columns exist for the application

  ## Changes
  - Add ml_prediction column to assessments table
  - Add question_text column to assessment_responses table
  - Add category_id column to assessment_responses table if missing
*/

-- Add missing columns to assessments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assessments' AND column_name = 'ml_prediction'
  ) THEN
    ALTER TABLE assessments ADD COLUMN ml_prediction text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assessments' AND column_name = 'scores'
  ) THEN
    ALTER TABLE assessments ADD COLUMN scores jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assessments' AND column_name = 'recommended_careers'
  ) THEN
    ALTER TABLE assessments ADD COLUMN recommended_careers text[] DEFAULT ARRAY[]::text[];
  END IF;
END $$;

-- Add missing columns to assessment_responses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assessment_responses' AND column_name = 'question_text'
  ) THEN
    ALTER TABLE assessment_responses ADD COLUMN question_text text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assessment_responses' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE assessment_responses ADD COLUMN category_id text;
  END IF;
END $$;
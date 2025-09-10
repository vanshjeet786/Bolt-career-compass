-- Add status and progress tracking to assessments table

-- 1. Add status column with a check constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assessments' AND column_name = 'status'
  ) THEN
    ALTER TABLE assessments ADD COLUMN status text DEFAULT 'in-progress';
    ALTER TABLE assessments ADD CONSTRAINT check_assessment_status CHECK (status IN ('in-progress', 'completed'));
  END IF;
END $$;

-- 2. Add current_layer_index column to store progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assessments' AND column_name = 'current_layer_index'
  ) THEN
    ALTER TABLE assessments ADD COLUMN current_layer_index integer DEFAULT 0;
  END IF;
END $$;

-- 3. Update all existing assessments to be 'completed'
-- This assumes that any assessment already in the table was fully completed.
UPDATE assessments
SET status = 'completed'
WHERE status IS NULL OR status = 'in-progress';

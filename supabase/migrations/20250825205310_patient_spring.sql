/*
  # Update assessments table structure

  1. Changes to assessments table
    - Ensure proper foreign key relationship with users table
    - Add indexes for better performance
    - Update RLS policies

  2. Changes to assessment_responses table
    - Add proper indexes
    - Ensure RLS policies are correct
*/

-- Update assessments table if needed
DO $$
BEGIN
  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assessments' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE assessments ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_assessment_id ON assessment_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_layer_number ON assessment_responses(layer_number);

-- Update RLS policies to be more specific
DROP POLICY IF EXISTS "User can access own assessments" ON assessments;
CREATE POLICY "Users can manage own assessments"
  ON assessments
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "User can access own responses" ON assessment_responses;
CREATE POLICY "Users can manage own assessment responses"
  ON assessment_responses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = assessment_responses.assessment_id
      AND assessments.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = assessment_responses.assessment_id
      AND assessments.user_id = auth.uid()
    )
  );
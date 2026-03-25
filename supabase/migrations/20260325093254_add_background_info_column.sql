/*
  # Add background_info column to assessments table

  This migration adds the missing background_info column that stores user background information
  collected during the background info page (professional background, student details, etc).
  
  ## Changes
  - Added background_info (jsonb) column to assessments table
  - Default value: empty object {}
  - Allows NULL for existing assessments
*/

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS background_info jsonb DEFAULT '{}'::jsonb;
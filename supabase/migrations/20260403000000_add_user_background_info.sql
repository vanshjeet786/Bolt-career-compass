/*
  # Add background_info column to users table

  This migration adds the background_info column that stores user background information
  so it can be saved persistently and pre-filled in future assessments.

  ## Changes
  - Added background_info (jsonb) column to users table
*/

ALTER TABLE users ADD COLUMN IF NOT EXISTS background_info jsonb;

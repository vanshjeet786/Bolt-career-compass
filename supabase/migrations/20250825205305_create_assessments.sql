/*
  # Create assessments and assessment_responses tables

  1. New Tables
    - `assessments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `completed_at` (timestamptz)
      - `scores` (jsonb)
      - `recommended_careers` (text[])
      - `ml_prediction` (text)
      - `status` (text)
    - `assessment_responses`
      - `id` (uuid, primary key)
      - `assessment_id` (uuid, references assessments)
      - `question_id` (text)
      - `question_text` (text)
      - `response_value` (jsonb)
      - `category_id` (text)
      - `layer_number` (integer)

  2. Security
    - Enable RLS on both tables
*/

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamptz DEFAULT now(),
  scores jsonb DEFAULT '{}'::jsonb,
  recommended_careers text[] DEFAULT ARRAY[]::text[],
  ml_prediction text,
  status text CHECK (status IN ('in_progress', 'completed')) DEFAULT 'in_progress',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for assessments
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Create assessment_responses table
CREATE TABLE IF NOT EXISTS assessment_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES assessments(id) ON DELETE CASCADE NOT NULL,
  question_id text NOT NULL,
  question_text text,
  response_value jsonb,
  category_id text,
  layer_number integer,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for assessment_responses
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;

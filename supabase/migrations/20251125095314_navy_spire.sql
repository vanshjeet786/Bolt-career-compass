/*
  # Fix Database Security Issues

  1. RLS Performance Optimization
    - Update all RLS policies to use `(select auth.uid())` instead of `auth.uid()`
    - This prevents re-evaluation of auth functions for each row

  2. Index Optimization
    - Remove unused indexes that aren't being utilized
    - Add optimized indexes based on actual query patterns

  3. Function Security
    - Fix search_path mutability in handle_new_user function

  4. Security Enhancements
    - Ensure all tables have proper RLS policies
    - Optimize policy performance
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_assessments_user_id;
DROP INDEX IF EXISTS idx_assessments_created_at;
DROP INDEX IF EXISTS idx_assessment_responses_assessment_id;
DROP INDEX IF EXISTS idx_assessment_responses_layer_number;

-- Drop existing RLS policies to recreate them with optimized performance
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can manage own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can manage own assessment responses" ON assessment_responses;

-- Recreate RLS policies with performance optimization
-- Users table policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Assessments table policies
CREATE POLICY "Users can manage own assessments"
  ON assessments
  FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Assessment responses table policies
CREATE POLICY "Users can manage own assessment responses"
  ON assessment_responses
  FOR ALL
  TO authenticated
  USING (
    assessment_id IN (
      SELECT id FROM assessments WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    assessment_id IN (
      SELECT id FROM assessments WHERE user_id = (select auth.uid())
    )
  );

-- Create optimized indexes based on actual query patterns
CREATE INDEX IF NOT EXISTS idx_assessments_user_status 
  ON assessments(user_id, status, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_assessment_responses_assessment 
  ON assessment_responses(assessment_id, layer_number);

CREATE INDEX IF NOT EXISTS idx_users_email 
  ON users(email) WHERE email IS NOT NULL;

-- Update handle_new_user function with secure search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    now(),
    now()
  );
  RETURN new;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Add additional security constraints
ALTER TABLE users ADD CONSTRAINT users_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE assessments ADD CONSTRAINT assessments_status_valid 
  CHECK (status IN ('in_progress', 'completed'));

-- Ensure all tables have RLS enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;

-- Add comments for documentation
COMMENT ON POLICY "Users can read own data" ON users IS 
  'Optimized RLS policy - users can only read their own data';

COMMENT ON POLICY "Users can manage own assessments" ON assessments IS 
  'Optimized RLS policy - users can only manage their own assessments';

COMMENT ON POLICY "Users can manage own assessment responses" ON assessment_responses IS 
  'Optimized RLS policy - users can only manage responses to their own assessments';

COMMENT ON INDEX idx_assessments_user_status IS 
  'Optimized index for user assessment queries with status filtering';

COMMENT ON INDEX idx_assessment_responses_assessment IS 
  'Optimized index for assessment response queries';
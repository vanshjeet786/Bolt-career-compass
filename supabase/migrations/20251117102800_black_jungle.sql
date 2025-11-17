/*
  # Fix RLS Performance and Security Issues

  1. Security Improvements
    - Update RLS policies to use (select auth.uid()) instead of auth.uid() for better performance
    - This prevents re-evaluation of auth functions for each row

  2. Policy Updates
    - Update all RLS policies on users, assessments, and assessment_responses tables
    - Maintain same security logic but with optimized performance

  3. Index Cleanup
    - Remove unused indexes that are not being utilized
*/

-- Drop existing RLS policies that have performance issues
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can manage own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can manage own assessment responses" ON public.assessment_responses;

-- Create optimized RLS policies using (select auth.uid())
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own data"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can manage own assessments"
  ON public.assessments
  FOR ALL
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can manage own assessment responses"
  ON public.assessment_responses
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.assessments
    WHERE assessments.id = assessment_responses.assessment_id
    AND assessments.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.assessments
    WHERE assessments.id = assessment_responses.assessment_id
    AND assessments.user_id = (select auth.uid())
  ));

-- Remove unused indexes to clean up database
DROP INDEX IF EXISTS idx_assessments_user_id;
DROP INDEX IF EXISTS idx_assessments_created_at;
DROP INDEX IF EXISTS idx_assessment_responses_assessment_id;
DROP INDEX IF EXISTS idx_assessment_responses_layer_number;

-- Create more targeted indexes based on actual query patterns
CREATE INDEX IF NOT EXISTS idx_assessments_user_status ON public.assessments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_assessment ON public.assessment_responses(assessment_id);

-- Update the handle_new_user function to have a stable search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;
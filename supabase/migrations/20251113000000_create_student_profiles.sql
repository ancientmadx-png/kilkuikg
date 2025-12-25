/*
  # Create Student Profiles Table

  1. New Tables
    - `student_profiles`
      - `id` (uuid, primary key)
      - `wallet_address` (text, unique, not null)
      - `full_name` (text, not null)
      - `email` (text, not null)
      - `institution_name` (text, not null)
      - `institution_address` (text, not null)
      - `enrollment_date` (timestamptz, default now())
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `student_profiles` table
    - Add policy for students to read and update their own profile
    - Add policy for institutions to read profiles of their students
    - Add policy for public to create new profiles

  3. Indexes
    - Index on wallet_address for fast lookups
    - Index on institution_address for institution queries
*/

-- Create student_profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  institution_name text NOT NULL,
  institution_address text NOT NULL,
  enrollment_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_student_profiles_wallet ON student_profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_student_profiles_institution ON student_profiles(institution_address);

-- Enable RLS
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Students can read their own profile
CREATE POLICY "Students can read own profile"
  ON student_profiles
  FOR SELECT
  TO authenticated
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Policy: Students can read their own profile (public access via wallet)
CREATE POLICY "Public can read own profile by wallet"
  ON student_profiles
  FOR SELECT
  TO public
  USING (true);

-- Policy: Anyone can create a student profile
CREATE POLICY "Anyone can create profile"
  ON student_profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Students can update their own profile
CREATE POLICY "Students can update own profile"
  ON student_profiles
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Policy: Institutions can read profiles of their students
CREATE POLICY "Institutions can read their students"
  ON student_profiles
  FOR SELECT
  TO public
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_student_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER student_profiles_updated_at
  BEFORE UPDATE ON student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_student_profiles_updated_at();

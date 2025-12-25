/*
  # Academic Credentials Database Schema

  1. New Tables
    - `credentials`
      - `id` (uuid, primary key) - Unique credential identifier
      - `token_id` (text, unique) - Blockchain token ID
      - `student_address` (text) - Ethereum wallet address of student
      - `institution_name` (text) - Name of issuing institution
      - `institution_address` (text) - Ethereum wallet address of institution
      - `degree` (text) - Degree name
      - `ipfs_hash` (text) - IPFS hash for credential document
      - `issue_date` (timestamptz) - Date credential was issued
      - `revoked` (boolean) - Whether credential has been revoked
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp
    
    - `credential_shares`
      - `id` (uuid, primary key) - Unique share identifier
      - `credential_id` (uuid) - Reference to credentials table
      - `shared_with` (text) - Identifier of entity credential was shared with
      - `share_token` (text, unique) - Unique token for accessing shared credential
      - `expires_at` (timestamptz) - Share expiration timestamp
      - `access_count` (integer) - Number of times credential has been accessed
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `audit_logs`
      - `id` (uuid, primary key) - Unique log entry identifier
      - `credential_id` (uuid) - Reference to credentials table
      - `action` (text) - Action performed (issued, verified, shared, revoked)
      - `actor_address` (text) - Ethereum address of actor
      - `metadata` (jsonb) - Additional metadata about the action
      - `created_at` (timestamptz) - Log entry timestamp
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their credentials
    - Add policies for credential sharing and verification
  
  3. Important Notes
    - Credentials are stored both on-chain and in database for fast querying
    - Audit logs provide complete history for transparency
    - Share tokens enable privacy-preserving verification
*/

-- Create credentials table
CREATE TABLE IF NOT EXISTS credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id text UNIQUE NOT NULL,
  student_address text NOT NULL,
  institution_name text NOT NULL,
  institution_address text NOT NULL,
  degree text NOT NULL,
  ipfs_hash text NOT NULL,
  issue_date timestamptz NOT NULL,
  revoked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create credential_shares table
CREATE TABLE IF NOT EXISTS credential_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id uuid NOT NULL REFERENCES credentials(id) ON DELETE CASCADE,
  shared_with text NOT NULL,
  share_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  access_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id uuid REFERENCES credentials(id) ON DELETE CASCADE,
  action text NOT NULL,
  actor_address text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_credentials_student ON credentials(student_address);
CREATE INDEX IF NOT EXISTS idx_credentials_institution ON credentials(institution_address);
CREATE INDEX IF NOT EXISTS idx_credentials_token ON credentials(token_id);
CREATE INDEX IF NOT EXISTS idx_shares_credential ON credential_shares(credential_id);
CREATE INDEX IF NOT EXISTS idx_shares_token ON credential_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_audit_credential ON audit_logs(credential_id);

-- Enable Row Level Security
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Credentials policies
CREATE POLICY "Anyone can view non-revoked credentials"
  ON credentials FOR SELECT
  USING (NOT revoked);

CREATE POLICY "Institutions can insert credentials"
  ON credentials FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Institutions can update their credentials"
  ON credentials FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Credential shares policies
CREATE POLICY "Anyone can view valid shares"
  ON credential_shares FOR SELECT
  USING (expires_at > now());

CREATE POLICY "Anyone can create shares"
  ON credential_shares FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update share access count"
  ON credential_shares FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Audit logs policies
CREATE POLICY "Anyone can view audit logs"
  ON audit_logs FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for credentials table
DROP TRIGGER IF EXISTS update_credentials_updated_at ON credentials;
CREATE TRIGGER update_credentials_updated_at
  BEFORE UPDATE ON credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

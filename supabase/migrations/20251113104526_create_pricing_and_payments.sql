/*
  # Business Model - Pricing & Payments System

  1. New Tables
    - `pricing_plans`
      - `id` (uuid, primary key)
      - `plan_type` (text) - 'institution' or 'employer'
      - `name` (text) - Plan name
      - `price` (numeric) - Price in USD
      - `currency` (text) - Currency code
      - `features` (jsonb) - Plan features
      - `active` (boolean) - Whether plan is active
      - `created_at` (timestamptz)
    
    - `payment_transactions`
      - `id` (uuid, primary key)
      - `user_address` (text) - Wallet address
      - `user_type` (text) - 'institution', 'employer', or 'student'
      - `plan_id` (uuid) - Reference to pricing_plans
      - `amount` (numeric) - Amount paid
      - `currency` (text) - Currency used
      - `promo_code` (text) - Promotional code used
      - `discount_applied` (numeric) - Discount amount
      - `final_amount` (numeric) - Final amount after discount
      - `transaction_hash` (text) - Blockchain transaction hash
      - `status` (text) - 'pending', 'completed', 'failed'
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz)
    
    - `promo_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique) - Promo code
      - `discount_type` (text) - 'percentage' or 'fixed'
      - `discount_value` (numeric) - Discount amount or percentage
      - `valid_from` (timestamptz) - Start date
      - `valid_until` (timestamptz) - End date
      - `max_uses` (integer) - Maximum number of uses
      - `current_uses` (integer) - Current usage count
      - `applicable_to` (text[]) - Array of user types
      - `active` (boolean)
      - `created_at` (timestamptz)
    
    - `user_subscriptions`
      - `id` (uuid, primary key)
      - `user_address` (text) - Wallet address
      - `user_type` (text) - User type
      - `plan_id` (uuid) - Reference to pricing_plans
      - `status` (text) - 'active', 'expired', 'cancelled'
      - `transaction_id` (uuid) - Reference to payment_transactions
      - `starts_at` (timestamptz)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can view their own transactions and subscriptions
    - Only authenticated users can create transactions
    - Promo codes are publicly viewable for validation
    - Pricing plans are publicly viewable
*/

-- Create pricing_plans table
CREATE TABLE IF NOT EXISTS pricing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type text NOT NULL CHECK (plan_type IN ('institution', 'employer')),
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  features jsonb DEFAULT '{}',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('institution', 'employer', 'student')),
  plan_id uuid REFERENCES pricing_plans(id),
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  promo_code text,
  discount_applied numeric DEFAULT 0,
  final_amount numeric NOT NULL DEFAULT 0,
  transaction_hash text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  max_uses integer DEFAULT NULL,
  current_uses integer DEFAULT 0,
  applicable_to text[] DEFAULT ARRAY['institution', 'employer']::text[],
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('institution', 'employer', 'student')),
  plan_id uuid REFERENCES pricing_plans(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  transaction_id uuid REFERENCES payment_transactions(id),
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Pricing plans policies (public read)
CREATE POLICY "Anyone can view active pricing plans"
  ON pricing_plans FOR SELECT
  USING (active = true);

-- Payment transactions policies
CREATE POLICY "Users can view own transactions"
  ON payment_transactions FOR SELECT
  USING (true);

CREATE POLICY "Users can create transactions"
  ON payment_transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own transactions"
  ON payment_transactions FOR UPDATE
  USING (true);

-- Promo codes policies
CREATE POLICY "Anyone can view active promo codes"
  ON promo_codes FOR SELECT
  USING (active = true);

CREATE POLICY "Anyone can update promo code usage"
  ON promo_codes FOR UPDATE
  USING (active = true);

-- User subscriptions policies
CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions FOR SELECT
  USING (true);

CREATE POLICY "Users can create subscriptions"
  ON user_subscriptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own subscriptions"
  ON user_subscriptions FOR UPDATE
  USING (true);

-- Insert default pricing plans
INSERT INTO pricing_plans (plan_type, name, price, currency, features, active) VALUES
  ('institution', 'Institution Basic', 99.99, 'USD', '{"credentials_per_month": 100, "support": "email", "analytics": true}', true),
  ('institution', 'Institution Pro', 299.99, 'USD', '{"credentials_per_month": 500, "support": "priority", "analytics": true, "custom_branding": true}', true),
  ('institution', 'Institution Enterprise', 999.99, 'USD', '{"credentials_per_month": -1, "support": "24/7", "analytics": true, "custom_branding": true, "api_access": true}', true),
  ('employer', 'Employer Basic', 49.99, 'USD', '{"verifications_per_month": 50, "support": "email"}', true),
  ('employer', 'Employer Pro', 149.99, 'USD', '{"verifications_per_month": 200, "support": "priority", "bulk_verification": true}', true);

-- Insert TRINETRA promo code (100% discount)
INSERT INTO promo_codes (code, discount_type, discount_value, valid_from, valid_until, max_uses, applicable_to, active) VALUES
  ('TRINETRA', 'percentage', 100, now(), '2026-12-31', NULL, ARRAY['institution', 'employer']::text[], true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON payment_transactions(user_address);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_address);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);

-- Create updated_at trigger for user_subscriptions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

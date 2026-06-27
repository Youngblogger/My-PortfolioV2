-- CODEMAFIA Academy - Complete Database Schema
-- Run this in your Supabase project SQL editor

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');
CREATE TYPE enrollment_status AS ENUM ('active', 'completed', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled');
CREATE TYPE payment_gateway AS ENUM ('paystack', 'flutterwave');
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  country TEXT,
  state TEXT,
  city TEXT,
  address TEXT,
  company TEXT,
  tax_id TEXT,
  role user_role DEFAULT 'student',
  bio TEXT,
  title TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ============================================
-- COURSES
-- ============================================
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  stack_id TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  short_description TEXT,
  category TEXT,
  icon TEXT,
  thumbnail_url TEXT,
  cover_url TEXT,
  instructor_id UUID REFERENCES profiles(id),
  instructor_name TEXT,
  instructor_title TEXT,
  instructor_avatar TEXT,
  instructor_bio TEXT,
  instructor_experience INT DEFAULT 0,
  instructor_students INTEGER DEFAULT 0,
  instructor_courses INT DEFAULT 1,
  instructor_rating DECIMAL(3,2) DEFAULT 0,
  duration TEXT,
  skill_level TEXT,
  language TEXT DEFAULT 'English',
  last_updated DATE,
  certificate_included BOOLEAN DEFAULT true,
  lifetime_access BOOLEAN DEFAULT true,
  mobile_access BOOLEAN DEFAULT true,
  downloadable_resources BOOLEAN DEFAULT true,
  projects_included BOOLEAN DEFAULT true,
  community_access BOOLEAN DEFAULT true,
  price_ngn DECIMAL(12,2) NOT NULL DEFAULT 0,
  price_usd DECIMAL(10,2) DEFAULT 0,
  original_price_ngn DECIMAL(12,2),
  original_price_usd DECIMAL(10,2),
  discount_percentage INT DEFAULT 0,
  currency TEXT DEFAULT 'NGN',
  is_free BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  students_enrolled INT DEFAULT 0,
  what_you_learn TEXT[] DEFAULT '{}',
  includes TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_stack ON courses(stack_id);
CREATE INDEX idx_courses_published ON courses(is_published);

-- ============================================
-- COURSE MODULES
-- ============================================
CREATE TABLE course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  lessons JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_modules_course ON course_modules(course_id);

-- ============================================
-- PRICING TIERS
-- ============================================
CREATE TABLE pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_ngn DECIMAL(12,2) NOT NULL,
  price_usd DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tiers_course ON pricing_tiers(course_id);

-- ============================================
-- ENROLLMENTS
-- ============================================
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  tier_id UUID REFERENCES pricing_tiers(id),
  enrollment_number TEXT UNIQUE NOT NULL,
  status enrollment_status DEFAULT 'active',
  progress DECIMAL(5,2) DEFAULT 0,
  certificate_url TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_enrollments_number ON enrollments(enrollment_number);

-- ============================================
-- TRANSACTIONS
-- ============================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  enrollment_id UUID REFERENCES enrollments(id),
  transaction_reference TEXT UNIQUE NOT NULL,
  payment_gateway payment_gateway NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status payment_status DEFAULT 'pending',
  gateway_response JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_reference ON transactions(transaction_reference);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_enrollment ON transactions(enrollment_id);

-- ============================================
-- INVOICES
-- ============================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id),
  enrollment_id UUID REFERENCES enrollments(id),
  transaction_id UUID REFERENCES transactions(id),
  course_name TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  payment_gateway payment_gateway,
  payment_method TEXT,
  subtotal DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  discount_code TEXT,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  grand_total DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status payment_status DEFAULT 'completed',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_user ON invoices(user_id);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_enrollment ON invoices(enrollment_id);

-- ============================================
-- RECEIPTS
-- ============================================
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT UNIQUE NOT NULL,
  transaction_reference TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id),
  enrollment_id UUID REFERENCES enrollments(id),
  invoice_id UUID REFERENCES invoices(id),
  course_name TEXT NOT NULL,
  student_name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_gateway payment_gateway,
  payment_method TEXT,
  currency TEXT DEFAULT 'NGN',
  status payment_status DEFAULT 'completed',
  receipt_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_receipts_user ON receipts(user_id);
CREATE INDEX idx_receipts_transaction ON receipts(transaction_reference);

-- ============================================
-- COUPONS
-- ============================================
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type discount_type NOT NULL,
  discount_value DECIMAL(12,2) NOT NULL,
  min_purchase DECIMAL(12,2) DEFAULT 0,
  max_uses INT DEFAULT 0,
  current_uses INT DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  course_id UUID REFERENCES courses(id),
  user_id UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);

-- ============================================
-- COURSE REVIEWS
-- ============================================
CREATE TABLE course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

CREATE INDEX idx_reviews_course ON course_reviews(course_id);

-- ============================================
-- AUDIT LOGS
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Sequences for number generation
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS receipt_number_seq START 1;

-- Generate enrollment number
CREATE OR REPLACE FUNCTION generate_enrollment_number()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT := 'CMA-';
  year_part TEXT := TO_CHAR(NOW(), 'YY');
  random_part TEXT := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
BEGIN
  RETURN prefix || year_part || '-' || random_part;
END;
$$ LANGUAGE plpgsql;

-- Generate invoice number (race-condition-free via sequence)
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT := 'INV-CMA-';
  year_part TEXT := TO_CHAR(NOW(), 'YYYY');
  seq BIGINT;
BEGIN
  seq := NEXTVAL('invoice_number_seq');
  RETURN prefix || year_part || '-' || LPAD(seq::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate receipt number (race-condition-free via sequence)
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT := 'RCT-CMA-';
  year_part TEXT := TO_CHAR(NOW(), 'YYYY');
  seq BIGINT;
BEGIN
  seq := NEXTVAL('receipt_number_seq');
  RETURN prefix || year_part || '-' || LPAD(seq::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read own, admins can read all
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Courses: public read for published
CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT
  USING (is_published = true);

-- Enrollments: users can view own, insert own
CREATE POLICY "Users can view own enrollments"
  ON enrollments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own enrollments"
  ON enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Transactions: users can view own
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Invoices: users can view own
CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert invoices"
  ON invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Receipts: users can view own
CREATE POLICY "Users can view own receipts"
  ON receipts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert receipts"
  ON receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Course modules: public read for published courses
CREATE POLICY "Anyone can view course modules"
  ON course_modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_modules.course_id
      AND courses.is_published = true
    )
  );

-- Pricing tiers: public read for active tiers
CREATE POLICY "Anyone can view active pricing tiers"
  ON pricing_tiers FOR SELECT
  USING (is_active = true);

-- Coupons: admin-only (no public access by default)
CREATE POLICY "Admins can manage coupons"
  ON coupons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Course reviews: users can view all, create own
CREATE POLICY "Anyone can view reviews"
  ON course_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create own reviews"
  ON course_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON course_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Audit logs: admin-only
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

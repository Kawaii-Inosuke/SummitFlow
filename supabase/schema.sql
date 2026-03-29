-- ============================================
-- SummitFlow Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  reg_no TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'Student' CHECK (role IN ('Student', 'Volunteer', 'Admin')),
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  domain TEXT,
  date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  venue TEXT NOT NULL,
  cover_image TEXT,
  organizer TEXT,
  access_type TEXT NOT NULL DEFAULT 'Free' CHECK (access_type IN ('Free', 'Paid')),
  price DECIMAL(10, 2) DEFAULT 0,
  total_budget DECIMAL(12, 2) DEFAULT 0,
  max_attendees INTEGER,
  status TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Draft', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled')),
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. REGISTRATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  qr_hash TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Checked-In', 'Cancelled')),
  full_name TEXT NOT NULL,
  student_id TEXT,
  phone TEXT,
  primary_interest TEXT,
  feedback_submitted BOOLEAN DEFAULT FALSE,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 10),
  feedback_liked TEXT,
  feedback_improved TEXT,
  certificate_generated BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- ============================================
-- 4. EXPENSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Hospitality', 'Marketing', 'Operations', 'Logistics', 'Other')),
  description TEXT,
  logged_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. SCAN LOGS TABLE (for real-time activity)
-- ============================================
CREATE TABLE IF NOT EXISTS public.scan_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID REFERENCES public.registrations(id),
  scanned_by UUID NOT NULL REFERENCES public.users(id),
  event_id UUID NOT NULL REFERENCES public.events(id),
  scan_result TEXT NOT NULL CHECK (scan_result IN ('Success', 'Duplicate', 'Invalid')),
  scan_location TEXT,
  scanned_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;

-- Users: anyone can read, only own profile can update
CREATE POLICY "Users are viewable by authenticated users" ON public.users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Service role can insert users" ON public.users
  FOR INSERT WITH CHECK (true);

-- Events: public read, admin write
CREATE POLICY "Events are viewable by everyone" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage events" ON public.events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'Admin')
  );

-- Registrations: users see own, admins/volunteers see all for their events
CREATE POLICY "Users can view own registrations" ON public.registrations
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role IN ('Admin', 'Volunteer'))
  );

CREATE POLICY "Authenticated users can register" ON public.registrations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Registrations can be updated by owner or staff" ON public.registrations
  FOR UPDATE USING (
    user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role IN ('Admin', 'Volunteer'))
  );

-- Expenses: admin only
CREATE POLICY "Admins can manage expenses" ON public.expenses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'Admin')
  );

-- Scan logs: admin and volunteers
CREATE POLICY "Staff can manage scan logs" ON public.scan_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role IN ('Admin', 'Volunteer'))
  );

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_logs;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_registrations_event ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON public.registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_qr ON public.registrations(qr_hash);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);
CREATE INDEX IF NOT EXISTS idx_expenses_event ON public.expenses(event_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_event ON public.scan_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_users_auth ON public.users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

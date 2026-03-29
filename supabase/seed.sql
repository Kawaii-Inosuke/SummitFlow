-- ============================================
-- SummitFlow Seed Data
-- Run AFTER schema.sql in Supabase SQL Editor
-- Populates demo data for a functional demo
-- ============================================

-- 1. SEED USERS (these match mock auth IDs)
INSERT INTO public.users (id, name, reg_no, email, role, points, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Ayush', 'RA2211003010622', 'ayush@srmist.edu.in', 'Student', 2540, '2023-09-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000002', 'Admin User', 'RA2211003010001', 'admin@srmist.edu.in', 'Admin', 5000, '2023-06-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000003', 'Arjun Sharma', 'RA2211003010100', 'arjun@srmist.edu.in', 'Volunteer', 1200, '2023-09-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000004', 'Priya Mehta', 'RA2211003010200', 'priya@srmist.edu.in', 'Volunteer', 800, '2023-10-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000005', 'Rahul Verma', 'RA2211003010300', 'rahul@srmist.edu.in', 'Student', 400, '2023-11-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000006', 'Sneha Das', 'RA2211003010400', 'sneha@srmist.edu.in', 'Student', 650, '2023-09-15T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000007', 'Vikram Singh', 'RA2211003010500', 'vikram@srmist.edu.in', 'Student', 320, '2023-10-15T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000008', 'Ananya Rao', 'RA2211003010600', 'ananya@srmist.edu.in', 'Student', 1100, '2023-08-01T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 2. SEED EVENTS
INSERT INTO public.events (id, title, description, domain, date, end_date, venue, organizer, access_type, price, total_budget, max_attendees, status, created_by) VALUES
  ('00000000-0000-0000-0000-000000000101',
   'E-Summit 2.0',
   'The annual entrepreneurship summit bringing together visionaries, investors, and startups. Network with industry leaders and pitch your ideas.',
   'ENTREPRENEURSHIP',
   '2024-10-12T10:00:00Z', '2024-10-12T18:00:00Z',
   'TP-2 Auditorium', 'E-Cell SRM', 'Paid', 49.00, 35000, 500, 'Completed',
   '00000000-0000-0000-0000-000000000002'),

  ('00000000-0000-0000-0000-000000000102',
   'DevOps Hackathon',
   'Building things from scratch — a 24-hour hackathon focused on DevOps and cloud infrastructure. Prizes worth ₹50,000.',
   'HACKATHON',
   '2024-11-05T09:00:00Z', '2024-11-06T09:00:00Z',
   'TP-2 Lab Complex', 'DSC SRM', 'Free', 0, 20000, 200, 'Upcoming',
   '00000000-0000-0000-0000-000000000002'),

  ('00000000-0000-0000-0000-000000000103',
   'CodeVita Global',
   'Test your coding skills against the best. Compete for internships at top tech companies like TCS, Wipro, and Infosys.',
   'HACKATHON',
   '2024-11-12T10:00:00Z', '2024-11-12T17:00:00Z',
   'TP-2 Lab Complex', 'Coding Club', 'Free', 0, 15000, 300, 'Upcoming',
   '00000000-0000-0000-0000-000000000002'),

  ('00000000-0000-0000-0000-000000000104',
   'Design Sprint 2024',
   'A 3-day intensive design workshop focused on solving complex UX problems using Google''s Design Sprint methodology.',
   'WORKSHOP',
   '2024-12-01T09:00:00Z', '2024-12-03T17:00:00Z',
   'TP-3 Studio 5', 'UX Club', 'Paid', 25.00, 10000, 50, 'Upcoming',
   '00000000-0000-0000-0000-000000000002'),

  ('00000000-0000-0000-0000-000000000105',
   'AI/ML Bootcamp',
   'Intensive 2-day bootcamp covering machine learning fundamentals, neural networks, and hands-on model training.',
   'TECHNOLOGY',
   '2024-12-15T09:00:00Z', '2024-12-16T17:00:00Z',
   'TP-1 Seminar Hall', 'AI Club SRM', 'Paid', 75.00, 25000, 150, 'Upcoming',
   '00000000-0000-0000-0000-000000000002'),

  ('00000000-0000-0000-0000-000000000106',
   'Startup Pitch Night',
   'Present your startup ideas to a panel of VCs and angel investors. Top 3 teams win seed funding.',
   'ENTREPRENEURSHIP',
   '2025-01-20T18:00:00Z', '2025-01-20T22:00:00Z',
   'Main Auditorium', 'E-Cell SRM', 'Free', 0, 18000, 100, 'Upcoming',
   '00000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED REGISTRATIONS (with pre-generated QR hashes)
INSERT INTO public.registrations (id, user_id, event_id, qr_hash, status, full_name, student_id, phone, primary_interest, feedback_submitted, feedback_rating, feedback_liked, feedback_improved, certificate_generated, checked_in_at, checked_in_by) VALUES
  -- Ayush registered for E-Summit (checked in, feedback given)
  ('00000000-0000-0000-0000-000000000201',
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101',
   'U2FsdGVkX1+esummit-ayush-qr-hash-2024', 'Checked-In',
   'Ayush', 'RA2211003010622', '+91-98765-43210', 'Entrepreneurship',
   true, 9, 'Great speakers and networking', 'Better seating', true,
   '2024-10-12T10:15:00Z', '00000000-0000-0000-0000-000000000003'),

  -- Ayush registered for Hackathon (pending)
  ('00000000-0000-0000-0000-000000000202',
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000102',
   'U2FsdGVkX1+hackathon-ayush-qr-hash-2024', 'Pending',
   'Ayush', 'RA2211003010622', '+91-98765-43210', 'DevOps',
   false, NULL, NULL, NULL, false, NULL, NULL),

  -- Arjun registered for E-Summit (checked in)
  ('00000000-0000-0000-0000-000000000203',
   '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000101',
   'U2FsdGVkX1+esummit-arjun-qr-hash-2024', 'Checked-In',
   'Arjun Sharma', 'RA2211003010100', '+91-98765-11111', 'Technology',
   true, 8, 'Well organized event', 'More food options', true,
   '2024-10-12T10:05:00Z', '00000000-0000-0000-0000-000000000004'),

  -- Priya registered for E-Summit (checked in)
  ('00000000-0000-0000-0000-000000000204',
   '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000101',
   'U2FsdGVkX1+esummit-priya-qr-hash-2024', 'Checked-In',
   'Priya Mehta', 'RA2211003010200', '+91-98765-22222', 'Marketing',
   false, NULL, NULL, NULL, false,
   '2024-10-12T10:20:00Z', '00000000-0000-0000-0000-000000000003'),

  -- Sneha registered for Hackathon (pending)
  ('00000000-0000-0000-0000-000000000205',
   '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000102',
   'U2FsdGVkX1+hackathon-sneha-qr-hash-2024', 'Pending',
   'Sneha Das', 'RA2211003010400', '+91-98765-44444', 'DevOps',
   false, NULL, NULL, NULL, false, NULL, NULL),

  -- Vikram registered for CodeVita (pending)
  ('00000000-0000-0000-0000-000000000206',
   '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000103',
   'U2FsdGVkX1+codevita-vikram-qr-hash-2024', 'Pending',
   'Vikram Singh', 'RA2211003010500', '+91-98765-55555', 'Technology',
   false, NULL, NULL, NULL, false, NULL, NULL),

  -- Ananya registered for E-Summit and Design Sprint
  ('00000000-0000-0000-0000-000000000207',
   '00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000101',
   'U2FsdGVkX1+esummit-ananya-qr-hash-2024', 'Checked-In',
   'Ananya Rao', 'RA2211003010600', '+91-98765-66666', 'Entrepreneurship',
   true, 10, 'Absolutely loved everything!', 'Nothing, it was perfect', true,
   '2024-10-12T10:30:00Z', '00000000-0000-0000-0000-000000000003'),

  ('00000000-0000-0000-0000-000000000208',
   '00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000104',
   'U2FsdGVkX1+designsprint-ananya-qr-hash-2024', 'Pending',
   'Ananya Rao', 'RA2211003010600', '+91-98765-66666', 'Design',
   false, NULL, NULL, NULL, false, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED EXPENSES (for E-Summit budget tracking)
INSERT INTO public.expenses (id, event_id, amount, category, description, logged_by) VALUES
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000101', 3450, 'Hospitality', 'Catering and refreshments for 500 attendees', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000101', 5350, 'Marketing', 'Social media ads, posters, and digital campaigns', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000101', 12400, 'Operations', 'Venue setup, AV equipment, stage design', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000101', 5000, 'Logistics', 'Transportation, volunteer kits, and signage', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000101', 1200, 'Hospitality', 'Speaker dinner and VIP refreshments', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000306', '00000000-0000-0000-0000-000000000101', 2800, 'Marketing', 'Influencer partnerships and campus banners', '00000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- 5. SEED SCAN LOGS (for scanner activity feed)
INSERT INTO public.scan_logs (id, registration_id, scanned_by, event_id, scan_result, scan_location, scanned_name) VALUES
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000101', 'Success', 'Main Entrance', 'Arjun Sharma'),
  ('00000000-0000-0000-0000-000000000402', NULL, '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000101', 'Success', 'Start Gate', 'Aryan Gupta'),
  ('00000000-0000-0000-0000-000000000403', NULL, '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000101', 'Invalid', 'Terrace A', NULL),
  ('00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000101', 'Success', 'VIP Lounge', 'Ayush Naranla'),
  ('00000000-0000-0000-0000-000000000405', '00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000101', 'Success', 'Side Entrance', 'Priya Mehta'),
  ('00000000-0000-0000-0000-000000000406', '00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000101', 'Success', 'Main Entrance', 'Ananya Rao'),
  ('00000000-0000-0000-0000-000000000407', '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000101', 'Duplicate', 'VIP Lounge', 'Arjun Sharma')
ON CONFLICT (id) DO NOTHING;

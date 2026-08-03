-- ============================================================
-- Virtual Manager AI — Real Seed Data Script
-- Run this in your Supabase SQL Editor to populate initial real records
-- ============================================================

-- 1. Create Default Company
INSERT INTO companies (id, name, code, email, phone, city, state, country, plan, status)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'Acme Global Enterprises',
  'ACME',
  'contact@acmeglobal.com',
  '+91 22 6789 0100',
  'Mumbai',
  'Maharashtra',
  'India',
  'enterprise',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- 2. Create Initial Branch Locations
INSERT INTO branches (id, company_id, name, code, address, city, state, pincode, phone, email, latitude, longitude, radius, status)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Headquarters — Mumbai', 'BOM-HQ', 'Level 12, Tower B, Bandra Kurla Complex', 'Mumbai', 'Maharashtra', '400051', '+91 22 6789 0100', 'mumbai.hq@acmeglobal.com', 19.066, 72.868, 200, 'active'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Tech Hub — Bengaluru', 'BLR-02', 'Prestige Tech Park, Outer Ring Road, Bellandur', 'Bengaluru', 'Karnataka', '560103', '+91 80 4567 8900', 'blr.tech@acmeglobal.com', 12.926, 77.684, 250, 'active'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'North Office — New Delhi', 'DEL-03', 'Statesman House, Barakhamba Road, Connaught Place', 'New Delhi', 'Delhi', '110001', '+91 11 2345 6789', 'delhi.office@acmeglobal.com', 28.628, 77.224, 200, 'active'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'West Zone — Pune', 'PUN-04', 'Phase 1, Hinjewadi Rajiv Gandhi IT Park', 'Pune', 'Maharashtra', '411057', '+91 20 8901 2345', 'pune.branch@acmeglobal.com', 18.591, 73.738, 150, 'active')
ON CONFLICT (id) DO NOTHING;

-- 3. Create Real Initial Employees (Or you can add them directly via the UI)
INSERT INTO employees (id, company_id, branch_id, employee_code, name, email, phone, role, status, work_mode, employment_type, joining_date)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'EMP-001', 'Alexander Pierce', 'admin@virtualmanager.ai', '+91 98765 43210', 'super_admin', 'active', 'office', 'full_time', '2023-01-15'),
  ('e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'EMP-002', 'Eleanor Vance', 'director@virtualmanager.ai', '+91 98765 43211', 'director', 'active', 'office', 'full_time', '2023-02-01'),
  ('e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'EMP-003', 'Marcus Brody', 'manager@virtualmanager.ai', '+91 98765 43212', 'branch_manager', 'active', 'office', 'full_time', '2023-03-10'),
  ('e0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'EMP-004', 'Sophia Sterling', 'employee@virtualmanager.ai', '+91 98765 43213', 'employee', 'active', 'office', 'full_time', '2023-05-20')
ON CONFLICT (id) DO NOTHING;

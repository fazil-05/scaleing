-- ============================================================
-- Virtual Manager AI — Complete Database Schema
-- Supabase PostgreSQL — Production Ready
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector"; -- for AI embeddings

-- ============================================================
-- COMPANIES
-- ============================================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  pincode TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#2563eb',
  secondary_color TEXT DEFAULT '#1d4ed8',
  timezone TEXT DEFAULT 'Asia/Kolkata',
  currency TEXT DEFAULT 'INR',
  fiscal_year_start TEXT DEFAULT '04-01',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  max_employees INTEGER DEFAULT 50,
  max_branches INTEGER DEFAULT 5,
  trial_ends_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BRANCHES
-- ============================================================
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  phone TEXT,
  email TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  radius INTEGER DEFAULT 200,
  manager_id UUID,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  working_hours_start TIME DEFAULT '09:00',
  working_hours_end TIME DEFAULT '18:00',
  working_days TEXT[] DEFAULT ARRAY['Mon','Tue','Wed','Thu','Fri'],
  late_threshold_minutes INTEGER DEFAULT 15,
  half_day_threshold_hours DECIMAL(4,2) DEFAULT 4.0,
  overtime_threshold_hours DECIMAL(4,2) DEFAULT 8.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, code)
);

-- ============================================================
-- DEPARTMENTS
-- ============================================================
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  head_id UUID,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DESIGNATIONS
-- ============================================================
CREATE TABLE designations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SHIFTS
-- ============================================================
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'general' CHECK (type IN ('morning', 'general', 'evening', 'night', 'flexible')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  late_threshold_minutes INTEGER DEFAULT 15,
  half_day_threshold_hours DECIMAL(4,2) DEFAULT 4.0,
  grace_period_minutes INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EMPLOYEES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE employees (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  designation_id UUID REFERENCES designations(id) ON DELETE SET NULL,
  shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
  reporting_manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  director_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  employee_code TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  dob DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  joining_date DATE,
  confirmation_date DATE,
  employment_type TEXT DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern', 'probation')),
  role TEXT DEFAULT 'employee' CHECK (role IN ('super_admin', 'company_admin', 'director', 'branch_manager', 'employee')),
  photo_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'terminated')),
  work_mode TEXT DEFAULT 'office' CHECK (work_mode IN ('office', 'remote', 'hybrid', 'field')),
  salary DECIMAL(12,2),
  bank_name TEXT,
  bank_account TEXT,
  bank_ifsc TEXT,
  pan_number TEXT,
  aadhar_number TEXT,
  uan_number TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, employee_code)
);

-- ============================================================
-- EMPLOYEE DOCUMENTS
-- ============================================================
CREATE TABLE employee_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  expiry_date DATE,
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES employees(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GEOFENCES
-- ============================================================
CREATE TABLE geofences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Main Office',
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  radius INTEGER DEFAULT 200,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ATTENDANCE
-- ============================================================
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  working_hours DECIMAL(5,2),
  break_hours DECIMAL(5,2) DEFAULT 0,
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  late_minutes INTEGER DEFAULT 0,
  early_checkout_minutes INTEGER DEFAULT 0,
  check_in_latitude DECIMAL(10,8),
  check_in_longitude DECIMAL(11,8),
  check_in_address TEXT,
  check_in_accuracy DECIMAL(8,2),
  check_in_photo_url TEXT,
  check_in_distance DECIMAL(10,2),
  check_out_latitude DECIMAL(10,8),
  check_out_longitude DECIMAL(11,8),
  check_out_address TEXT,
  check_out_accuracy DECIMAL(8,2),
  check_out_photo_url TEXT,
  check_out_distance DECIMAL(10,2),
  status TEXT DEFAULT 'absent' CHECK (status IN ('present', 'late', 'half_day', 'absent', 'holiday', 'leave', 'weekend', 'work_from_home')),
  work_mode TEXT DEFAULT 'office' CHECK (work_mode IN ('office', 'remote', 'field', 'home')),
  device TEXT,
  browser TEXT,
  ip_address TEXT,
  notes TEXT,
  approved_by UUID REFERENCES employees(id),
  is_regularized BOOLEAN DEFAULT FALSE,
  regularization_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- ============================================================
-- ATTENDANCE LOGS (audit trail)
-- ============================================================
CREATE TABLE attendance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attendance_id UUID NOT NULL REFERENCES attendance(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  action TEXT NOT NULL CHECK (action IN ('check_in', 'check_out', 'regularize', 'approve')),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  address TEXT,
  accuracy DECIMAL(8,2),
  distance DECIMAL(10,2),
  device TEXT,
  browser TEXT,
  ip_address TEXT,
  photo_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES employees(id),
  name TEXT NOT NULL,
  description TEXT,
  code TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'active' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  budget DECIMAL(15,2),
  color TEXT DEFAULT '#2563eb',
  progress INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project members
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'manager', 'member', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, employee_id)
);

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES employees(id),
  assigned_to UUID REFERENCES employees(id),
  assigned_to_department UUID REFERENCES departments(id),
  director_id UUID REFERENCES employees(id),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'rejected', 'blocked', 'cancelled', 'reopened')),
  due_date DATE,
  start_date DATE,
  estimated_hours DECIMAL(6,2),
  actual_hours DECIMAL(6,2),
  completion_percentage INTEGER DEFAULT 0,
  tags TEXT[],
  is_milestone BOOLEAN DEFAULT FALSE,
  milestone_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Task comments
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task attachments
CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DAILY WORK REPORTS
-- ============================================================
CREATE TABLE daily_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  date DATE NOT NULL,
  work_done TEXT,
  client_visits TEXT,
  products_discussed TEXT,
  problems_faced TEXT,
  solutions_applied TEXT,
  tomorrow_plan TEXT,
  hours_worked DECIMAL(5,2),
  remarks TEXT,
  ai_score INTEGER,
  ai_feedback TEXT,
  ai_flags TEXT[],
  is_flagged BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'flagged', 'approved')),
  reviewed_by UUID REFERENCES employees(id),
  reviewed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- Report attachments
CREATE TABLE report_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  attachment_type TEXT DEFAULT 'document' CHECK (attachment_type IN ('document', 'photo', 'video', 'pdf', 'excel')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI AUDIT RESULTS
-- ============================================================
CREATE TABLE ai_audit_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  keyword_match_score INTEGER DEFAULT 0,
  completeness_score INTEGER DEFAULT 0,
  authenticity_score INTEGER DEFAULT 0,
  relevance_score INTEGER DEFAULT 0,
  is_copy_paste BOOLEAN DEFAULT FALSE,
  is_duplicate BOOLEAN DEFAULT FALSE,
  is_suspicious BOOLEAN DEFAULT FALSE,
  missing_fields TEXT[],
  flags TEXT[],
  suggestions TEXT,
  raw_analysis JSONB,
  model_used TEXT DEFAULT 'gpt-4o',
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SOP CATEGORIES
-- ============================================================
CREATE TABLE sop_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT DEFAULT '#2563eb',
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SOPs (Standard Operating Procedures)
-- ============================================================
CREATE TABLE sops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES sop_categories(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES employees(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  tags TEXT[],
  file_url TEXT,
  file_type TEXT,
  version TEXT DEFAULT '1.0',
  is_published BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SOP bookmarks
CREATE TABLE sop_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sop_id UUID NOT NULL REFERENCES sops(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sop_id, employee_id)
);

-- ============================================================
-- RESOURCES (Documents, Videos, etc.)
-- ============================================================
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES employees(id),
  category TEXT DEFAULT 'general' CHECK (category IN ('pdf', 'video', 'presentation', 'manual', 'policy', 'form', 'brochure', 'marketing', 'training', 'general')),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  thumbnail_url TEXT,
  tags TEXT[],
  is_public BOOLEAN DEFAULT TRUE,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LEAVE TYPES
-- ============================================================
CREATE TABLE leave_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  max_days_per_year INTEGER DEFAULT 12,
  max_days_per_request INTEGER DEFAULT 30,
  carry_forward BOOLEAN DEFAULT FALSE,
  carry_forward_limit INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT TRUE,
  requires_document BOOLEAN DEFAULT FALSE,
  color TEXT DEFAULT '#2563eb',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LEAVE BALANCES
-- ============================================================
CREATE TABLE leave_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  total_days DECIMAL(5,2) DEFAULT 0,
  used_days DECIMAL(5,2) DEFAULT 0,
  pending_days DECIMAL(5,2) DEFAULT 0,
  remaining_days DECIMAL(5,2) GENERATED ALWAYS AS (total_days - used_days - pending_days) STORED,
  carry_forward_days DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, leave_type_id, year)
);

-- ============================================================
-- LEAVES
-- ============================================================
CREATE TABLE leaves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  leave_type_id UUID REFERENCES leave_types(id),
  leave_type TEXT NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  total_days DECIMAL(5,2),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HOLIDAYS
-- ============================================================
CREATE TABLE holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT DEFAULT 'national' CHECK (type IN ('national', 'regional', 'festival', 'optional', 'company')),
  description TEXT,
  is_optional BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES employees(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general' CHECK (type IN ('attendance', 'task', 'leave', 'announcement', 'report', 'ai_alert', 'general', 'system')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  department_id UUID REFERENCES departments(id),
  created_by UUID NOT NULL REFERENCES employees(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'general' CHECK (type IN ('general', 'urgent', 'policy', 'event', 'hr')),
  target_roles TEXT[],
  is_pinned BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONVERSATIONS (Chat)
-- ============================================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'channel')),
  name TEXT,
  created_by UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  UNIQUE(conversation_id, employee_id)
);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES employees(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  content TEXT,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'file', 'image', 'video', 'system')),
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PERFORMANCE REVIEWS
-- ============================================================
CREATE TABLE performance_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES employees(id),
  period_type TEXT DEFAULT 'monthly' CHECK (period_type IN ('monthly', 'quarterly', 'half_yearly', 'yearly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  attendance_score DECIMAL(5,2) DEFAULT 0,
  task_completion_score DECIMAL(5,2) DEFAULT 0,
  punctuality_score DECIMAL(5,2) DEFAULT 0,
  report_quality_score DECIMAL(5,2) DEFAULT 0,
  client_visit_score DECIMAL(5,2) DEFAULT 0,
  training_score DECIMAL(5,2) DEFAULT 0,
  ai_score DECIMAL(5,2) DEFAULT 0,
  overall_score DECIMAL(5,2) DEFAULT 0,
  grade TEXT,
  comments TEXT,
  goals_set TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'acknowledged')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DOCUMENTS (Company Documents)
-- ============================================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES employees(id),
  branch_id UUID REFERENCES branches(id),
  department_id UUID REFERENCES departments(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  version TEXT DEFAULT '1.0',
  is_confidential BOOLEAN DEFAULT FALSE,
  access_roles TEXT[],
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES employees(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WEBSITE ANALYTICS
-- ============================================================
CREATE TABLE website_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES employees(id),
  page_path TEXT NOT NULL,
  page_title TEXT,
  event_type TEXT DEFAULT 'pageview' CHECK (event_type IN ('pageview', 'click', 'scroll', 'form_submit', 'error')),
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  duration_seconds INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMPANY SETTINGS
-- ============================================================
CREATE TABLE company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID UNIQUE NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  attendance_radius INTEGER DEFAULT 200,
  allow_remote_checkin BOOLEAN DEFAULT FALSE,
  require_photo_checkin BOOLEAN DEFAULT FALSE,
  auto_checkout_time TIME DEFAULT '20:00',
  ai_report_audit BOOLEAN DEFAULT TRUE,
  ai_score_threshold INTEGER DEFAULT 60,
  notify_director_on_flag BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  whatsapp_notifications BOOLEAN DEFAULT FALSE,
  work_week_start TEXT DEFAULT 'Mon',
  weekend_days TEXT[] DEFAULT ARRAY['Sat', 'Sun'],
  overtime_policy TEXT DEFAULT 'standard',
  leave_approval_chain TEXT DEFAULT 'manager',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX idx_attendance_company_date ON attendance(company_id, date);
CREATE INDEX idx_attendance_branch_date ON attendance(branch_id, date);
CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_employees_branch ON employees(branch_id);
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_company ON tasks(company_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_daily_reports_employee_date ON daily_reports(employee_id, date);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_analytics_session ON website_analytics(session_id);
CREATE INDEX idx_audit_logs_company ON audit_logs(company_id, created_at);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_audit_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofences ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's company_id
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM employees WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function to get user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM employees WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: is admin or higher
CREATE OR REPLACE FUNCTION is_admin_or_higher()
RETURNS BOOLEAN AS $$
  SELECT role IN ('super_admin', 'company_admin', 'director', 'branch_manager')
  FROM employees WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Employees: can see own company's employees
CREATE POLICY "employees_company_access" ON employees
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "employees_self_update" ON employees
  FOR UPDATE USING (id = auth.uid() OR is_admin_or_higher());

CREATE POLICY "employees_admin_insert" ON employees
  FOR INSERT WITH CHECK (is_admin_or_higher());

-- Attendance: employees see their own, admins see company
CREATE POLICY "attendance_self_read" ON attendance
  FOR SELECT USING (
    employee_id = auth.uid() OR
    (company_id = get_user_company_id() AND is_admin_or_higher())
  );

CREATE POLICY "attendance_self_insert" ON attendance
  FOR INSERT WITH CHECK (employee_id = auth.uid());

CREATE POLICY "attendance_admin_update" ON attendance
  FOR UPDATE USING (
    employee_id = auth.uid() OR is_admin_or_higher()
  );

-- Branches: company access
CREATE POLICY "branches_company_read" ON branches
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "branches_admin_write" ON branches
  FOR ALL USING (company_id = get_user_company_id() AND is_admin_or_higher());

-- Departments
CREATE POLICY "departments_company_read" ON departments
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "departments_admin_write" ON departments
  FOR ALL USING (company_id = get_user_company_id() AND is_admin_or_higher());

-- Tasks
CREATE POLICY "tasks_access" ON tasks
  FOR SELECT USING (
    company_id = get_user_company_id() AND (
      assigned_to = auth.uid() OR
      created_by = auth.uid() OR
      is_admin_or_higher()
    )
  );

CREATE POLICY "tasks_create" ON tasks
  FOR INSERT WITH CHECK (company_id = get_user_company_id() AND is_admin_or_higher());

CREATE POLICY "tasks_update" ON tasks
  FOR UPDATE USING (
    company_id = get_user_company_id() AND (
      assigned_to = auth.uid() OR is_admin_or_higher()
    )
  );

-- Daily reports
CREATE POLICY "reports_self_access" ON daily_reports
  FOR SELECT USING (
    employee_id = auth.uid() OR
    (company_id = get_user_company_id() AND is_admin_or_higher())
  );

CREATE POLICY "reports_self_insert" ON daily_reports
  FOR INSERT WITH CHECK (employee_id = auth.uid());

CREATE POLICY "reports_self_update" ON daily_reports
  FOR UPDATE USING (
    employee_id = auth.uid() OR is_admin_or_higher()
  );

-- Leaves
CREATE POLICY "leaves_access" ON leaves
  FOR SELECT USING (
    employee_id = auth.uid() OR
    (company_id = get_user_company_id() AND is_admin_or_higher())
  );

CREATE POLICY "leaves_self_insert" ON leaves
  FOR INSERT WITH CHECK (employee_id = auth.uid());

CREATE POLICY "leaves_admin_update" ON leaves
  FOR UPDATE USING (is_admin_or_higher());

-- Notifications: own only
CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- SOPs: company wide read
CREATE POLICY "sops_company_read" ON sops
  FOR SELECT USING (company_id = get_user_company_id() AND is_published = TRUE);

CREATE POLICY "sops_admin_write" ON sops
  FOR ALL USING (company_id = get_user_company_id() AND is_admin_or_higher());

-- Resources: company wide read
CREATE POLICY "resources_company_read" ON resources
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "resources_admin_write" ON resources
  FOR ALL USING (company_id = get_user_company_id() AND is_admin_or_higher());

-- Holidays: company wide read
CREATE POLICY "holidays_company_read" ON holidays
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "holidays_admin_write" ON holidays
  FOR ALL USING (company_id = get_user_company_id() AND is_admin_or_higher());

-- Company settings
CREATE POLICY "settings_company_read" ON company_settings
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "settings_admin_write" ON company_settings
  FOR ALL USING (company_id = get_user_company_id() AND is_admin_or_higher());

-- Geofences
CREATE POLICY "geofences_company_read" ON geofences
  FOR SELECT USING (company_id = get_user_company_id());

-- Analytics
CREATE POLICY "analytics_own_insert" ON website_analytics
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "analytics_admin_read" ON website_analytics
  FOR SELECT USING (is_admin_or_higher());

-- Messages
CREATE POLICY "messages_participant_access" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.employee_id = auth.uid()
    )
  );

CREATE POLICY "messages_participant_insert" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.employee_id = auth.uid()
    )
  );

-- Performance reviews
CREATE POLICY "performance_reviews_access" ON performance_reviews
  FOR SELECT USING (
    employee_id = auth.uid() OR
    reviewer_id = auth.uid() OR
    (company_id = get_user_company_id() AND is_admin_or_higher())
  );

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_leaves_updated_at BEFORE UPDATE ON leaves FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_daily_reports_updated_at BEFORE UPDATE ON daily_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_sops_updated_at BEFORE UPDATE ON sops FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-calculate working hours on attendance update
CREATE OR REPLACE FUNCTION calculate_working_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.check_in IS NOT NULL AND NEW.check_out IS NOT NULL THEN
    NEW.working_hours = ROUND(
      EXTRACT(EPOCH FROM (NEW.check_out - NEW.check_in)) / 3600.0,
      2
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calc_working_hours
  BEFORE INSERT OR UPDATE OF check_in, check_out ON attendance
  FOR EACH ROW EXECUTE FUNCTION calculate_working_hours();

-- ============================================================
-- DEFAULT SEED DATA (inserted after company creation via trigger)
-- ============================================================

-- Function to create default leave types for new company
CREATE OR REPLACE FUNCTION create_default_leave_types()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO leave_types (company_id, name, code, max_days_per_year, is_paid, color) VALUES
    (NEW.id, 'Casual Leave', 'CL', 12, TRUE, '#2563eb'),
    (NEW.id, 'Sick Leave', 'SL', 12, TRUE, '#ef4444'),
    (NEW.id, 'Earned Leave', 'EL', 15, TRUE, '#10b981'),
    (NEW.id, 'Maternity Leave', 'ML', 180, TRUE, '#ec4899'),
    (NEW.id, 'Emergency Leave', 'EM', 5, TRUE, '#f59e0b'),
    (NEW.id, 'Unpaid Leave', 'UL', 30, FALSE, '#64748b');

  INSERT INTO company_settings (company_id) VALUES (NEW.id);

  INSERT INTO sop_categories (company_id, name, icon, color, sort_order) VALUES
    (NEW.id, 'Sales', '💼', '#2563eb', 1),
    (NEW.id, 'HR', '👥', '#10b981', 2),
    (NEW.id, 'Technical', '⚙️', '#8b5cf6', 3),
    (NEW.id, 'Support', '🎯', '#f59e0b', 4),
    (NEW.id, 'Emergency', '🚨', '#ef4444', 5),
    (NEW.id, 'Products', '📦', '#06b6d4', 6),
    (NEW.id, 'Marketing', '📢', '#ec4899', 7),
    (NEW.id, 'Training', '🎓', '#84cc16', 8);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_company_created
  AFTER INSERT ON companies
  FOR EACH ROW EXECUTE FUNCTION create_default_leave_types();

-- ============================================================
-- STORAGE BUCKETS (run in Supabase dashboard or CLI)
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
-- insert into storage.buckets (id, name, public) values ('documents', 'documents', false);
-- insert into storage.buckets (id, name, public) values ('reports', 'reports', false);
-- insert into storage.buckets (id, name, public) values ('resources', 'resources', true);
-- insert into storage.buckets (id, name, public) values ('attendance-photos', 'attendance-photos', false);

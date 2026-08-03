// src/types/index.ts
// Complete TypeScript type definitions for Virtual Manager AI

export type UserRole = 'super_admin' | 'company_admin' | 'director' | 'branch_manager' | 'employee';
export type AttendanceStatus = 'present' | 'late' | 'half_day' | 'absent' | 'holiday' | 'leave' | 'weekend' | 'work_from_home';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'rejected' | 'blocked' | 'cancelled' | 'reopened';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern' | 'probation';
export type WorkMode = 'office' | 'remote' | 'hybrid' | 'field';
export type EmployeeStatus = 'active' | 'inactive' | 'on_leave' | 'terminated';

// ─── Company ──────────────────────────────────────────────
export interface Company {
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  timezone?: string;
  currency?: string;
  status: 'active' | 'inactive' | 'suspended';
  plan?: 'starter' | 'professional' | 'enterprise';
  max_employees?: number;
  max_branches?: number;
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ─── Branch ───────────────────────────────────────────────
export interface Branch {
  id: string;
  company_id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  radius: number;
  manager_id?: string;
  status: 'active' | 'inactive';
  working_hours_start?: string;
  working_hours_end?: string;
  working_days?: string[];
  late_threshold_minutes?: number;
  half_day_threshold_hours?: number;
  overtime_threshold_hours?: number;
  created_at: string;
  updated_at: string;
  manager?: Partial<Employee>;
  employee_count?: number;
  geofences?: Geofence[];
}

// ─── Department ───────────────────────────────────────────
export interface Department {
  id: string;
  company_id: string;
  branch_id?: string;
  name: string;
  code?: string;
  description?: string;
  head_id?: string;
  status: 'active' | 'inactive';
  created_at: string;
  branches?: { id: string; name: string };
  head?: Partial<Employee>;
  employee_count?: number;
}

// ─── Designation ──────────────────────────────────────────
export interface Designation {
  id: string;
  company_id: string;
  department_id?: string;
  name: string;
  level?: number;
  created_at: string;
}

// ─── Shift ────────────────────────────────────────────────
export interface Shift {
  id: string;
  company_id: string;
  name: string;
  type: 'morning' | 'general' | 'evening' | 'night' | 'flexible';
  start_time: string;
  end_time: string;
  late_threshold_minutes: number;
  half_day_threshold_hours: number;
  grace_period_minutes: number;
  created_at: string;
}

// ─── Employee ─────────────────────────────────────────────
export interface Employee {
  id: string;
  company_id: string;
  branch_id?: string;
  department_id?: string;
  designation_id?: string;
  shift_id?: string;
  reporting_manager_id?: string;
  director_id?: string;
  employee_code: string;
  name: string;
  email: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  dob?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  joining_date?: string;
  confirmation_date?: string;
  employment_type: EmploymentType;
  role: UserRole;
  photo_url?: string;
  status: EmployeeStatus;
  work_mode: WorkMode;
  salary?: number;
  bank_name?: string;
  bank_account?: string;
  bank_ifsc?: string;
  pan_number?: string;
  aadhar_number?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  branches?: { id: string; name: string; code: string };
  departments?: { id: string; name: string };
  designations?: { id: string; name: string };
  reporting_manager?: Partial<Employee>;
  today_attendance?: Partial<Attendance>;
}

// ─── Employee Document ────────────────────────────────────
export interface EmployeeDocument {
  id: string;
  employee_id: string;
  company_id: string;
  document_type: string;
  document_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  expiry_date?: string;
  verified: boolean;
  verified_by?: string;
  notes?: string;
  created_at: string;
}

// ─── Geofence ─────────────────────────────────────────────
export interface Geofence {
  id: string;
  branch_id: string;
  company_id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  is_active: boolean;
  created_at: string;
}

// ─── Attendance ───────────────────────────────────────────
export interface Attendance {
  id: string;
  employee_id: string;
  company_id: string;
  branch_id?: string;
  date: string;
  check_in?: string;
  check_out?: string;
  working_hours?: number;
  break_hours?: number;
  overtime_hours?: number;
  late_minutes?: number;
  early_checkout_minutes?: number;
  check_in_latitude?: number;
  check_in_longitude?: number;
  check_in_address?: string;
  check_in_accuracy?: number;
  check_in_photo_url?: string;
  check_in_distance?: number;
  check_out_latitude?: number;
  check_out_longitude?: number;
  check_out_address?: string;
  check_out_accuracy?: number;
  check_out_photo_url?: string;
  check_out_distance?: number;
  status: AttendanceStatus;
  work_mode?: WorkMode;
  device?: string;
  browser?: string;
  ip_address?: string;
  notes?: string;
  is_regularized?: boolean;
  created_at: string;
  updated_at: string;
  employee?: Partial<Employee>;
}

// ─── Project ──────────────────────────────────────────────
export interface Project {
  id: string;
  company_id: string;
  branch_id?: string;
  department_id?: string;
  created_by: string;
  name: string;
  description?: string;
  code?: string;
  priority: TaskPriority;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  budget?: number;
  color?: string;
  progress: number;
  created_at: string;
  updated_at: string;
  creator?: Partial<Employee>;
  members?: ProjectMember[];
  task_count?: number;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  employee_id: string;
  role: 'owner' | 'manager' | 'member' | 'viewer';
  created_at: string;
  employee?: Partial<Employee>;
}

// ─── Task ─────────────────────────────────────────────────
export interface Task {
  id: string;
  company_id: string;
  project_id?: string;
  branch_id?: string;
  department_id?: string;
  parent_task_id?: string;
  created_by: string;
  assigned_to?: string;
  assigned_to_department?: string;
  director_id?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string;
  start_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  completion_percentage: number;
  tags?: string[];
  is_milestone: boolean;
  milestone_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  creator?: Partial<Employee>;
  assignee?: Partial<Employee>;
  project?: Partial<Project>;
  subtasks?: Task[];
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
}

export interface TaskComment {
  id: string;
  task_id: string;
  employee_id: string;
  comment: string;
  created_at: string;
  employee?: Partial<Employee>;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  employee_id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
}

// ─── Daily Report ─────────────────────────────────────────
export interface DailyReport {
  id: string;
  employee_id: string;
  company_id: string;
  branch_id?: string;
  date: string;
  work_done?: string;
  client_visits?: string;
  products_discussed?: string;
  problems_faced?: string;
  solutions_applied?: string;
  tomorrow_plan?: string;
  hours_worked?: number;
  remarks?: string;
  ai_score?: number;
  ai_feedback?: string;
  ai_flags?: string[];
  is_flagged: boolean;
  status: 'submitted' | 'reviewed' | 'flagged' | 'approved';
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  employee?: Partial<Employee>;
  attachments?: ReportAttachment[];
  ai_audit?: AIAuditResult;
}

export interface ReportAttachment {
  id: string;
  report_id: string;
  employee_id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  attachment_type: 'document' | 'photo' | 'video' | 'pdf' | 'excel';
  created_at: string;
}

// ─── AI Audit ─────────────────────────────────────────────
export interface AIAuditResult {
  id: string;
  report_id: string;
  employee_id: string;
  company_id: string;
  score: number;
  keyword_match_score: number;
  completeness_score: number;
  authenticity_score: number;
  relevance_score: number;
  is_copy_paste: boolean;
  is_duplicate: boolean;
  is_suspicious: boolean;
  missing_fields?: string[];
  flags?: string[];
  suggestions?: string;
  raw_analysis?: Record<string, unknown>;
  model_used: string;
  created_at: string;
}

// ─── SOP ──────────────────────────────────────────────────
export interface SOPCategory {
  id: string;
  company_id: string;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  sort_order: number;
  created_at: string;
  sop_count?: number;
}

export interface SOP {
  id: string;
  company_id: string;
  category_id?: string;
  created_by: string;
  title: string;
  content: string;
  summary?: string;
  tags?: string[];
  file_url?: string;
  file_type?: string;
  version: string;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  category?: SOPCategory;
  creator?: Partial<Employee>;
  is_bookmarked?: boolean;
}

// ─── Resource ─────────────────────────────────────────────
export interface Resource {
  id: string;
  company_id: string;
  uploaded_by: string;
  category: string;
  title: string;
  description?: string;
  file_url: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  thumbnail_url?: string;
  tags?: string[];
  is_public: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
  uploader?: Partial<Employee>;
}

// ─── Leave ────────────────────────────────────────────────
export interface LeaveType {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description?: string;
  max_days_per_year: number;
  max_days_per_request: number;
  carry_forward: boolean;
  carry_forward_limit: number;
  is_paid: boolean;
  requires_document: boolean;
  color: string;
  created_at: string;
}

export interface LeaveBalance {
  id: string;
  employee_id: string;
  company_id: string;
  leave_type_id: string;
  year: number;
  total_days: number;
  used_days: number;
  pending_days: number;
  remaining_days: number;
  carry_forward_days: number;
  leave_type?: LeaveType;
}

export interface Leave {
  id: string;
  employee_id: string;
  company_id: string;
  branch_id?: string;
  leave_type_id?: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  total_days?: number;
  reason: string;
  status: LeaveStatus;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  document_url?: string;
  created_at: string;
  updated_at: string;
  employee?: Partial<Employee>;
  approver?: Partial<Employee>;
}

// ─── Holiday ──────────────────────────────────────────────
export interface Holiday {
  id: string;
  company_id: string;
  branch_id?: string;
  name: string;
  date: string;
  type: 'national' | 'regional' | 'festival' | 'optional' | 'company';
  description?: string;
  is_optional: boolean;
  created_at: string;
}

// ─── Notification ─────────────────────────────────────────
export interface Notification {
  id: string;
  company_id: string;
  user_id: string;
  sender_id?: string;
  title: string;
  message: string;
  type: 'attendance' | 'task' | 'leave' | 'announcement' | 'report' | 'ai_alert' | 'general' | 'system';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  sender?: Partial<Employee>;
}

// ─── Announcement ─────────────────────────────────────────
export interface Announcement {
  id: string;
  company_id: string;
  branch_id?: string;
  department_id?: string;
  created_by: string;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'policy' | 'event' | 'hr';
  target_roles?: string[];
  is_pinned: boolean;
  expires_at?: string;
  created_at: string;
  creator?: Partial<Employee>;
}

// ─── Chat ─────────────────────────────────────────────────
export interface Conversation {
  id: string;
  company_id: string;
  type: 'direct' | 'group' | 'channel';
  name?: string;
  created_by: string;
  created_at: string;
  participants?: ConversationParticipant[];
  last_message?: Partial<Message>;
  unread_count?: number;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  employee_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  last_read_at?: string;
  employee?: Partial<Employee>;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  company_id: string;
  content?: string;
  type: 'text' | 'file' | 'image' | 'video' | 'system';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  sender?: Partial<Employee>;
}

// ─── Performance ──────────────────────────────────────────
export interface PerformanceReview {
  id: string;
  employee_id: string;
  company_id: string;
  reviewer_id: string;
  period_type: 'monthly' | 'quarterly' | 'half_yearly' | 'yearly';
  period_start: string;
  period_end: string;
  attendance_score: number;
  task_completion_score: number;
  punctuality_score: number;
  report_quality_score: number;
  client_visit_score: number;
  training_score: number;
  ai_score: number;
  overall_score: number;
  grade?: string;
  comments?: string;
  goals_set?: string;
  status: 'draft' | 'submitted' | 'acknowledged';
  created_at: string;
  updated_at: string;
  employee?: Partial<Employee>;
  reviewer?: Partial<Employee>;
}

// ─── Analytics ────────────────────────────────────────────
export interface AnalyticsEvent {
  session_id: string;
  user_id?: string;
  company_id?: string;
  page_path: string;
  page_title?: string;
  event_type: 'pageview' | 'click' | 'scroll' | 'form_submit' | 'error';
  referrer?: string;
  duration_seconds?: number;
  metadata?: Record<string, unknown>;
}

// ─── Dashboard Stats ──────────────────────────────────────
export interface DashboardStats {
  total_employees: number;
  total_branches: number;
  today_present: number;
  today_late: number;
  today_absent: number;
  today_on_leave: number;
  today_half_day: number;
  today_wfh: number;
  pending_leaves: number;
  pending_tasks: number;
  flagged_reports: number;
  avg_working_hours: number;
}

// ─── GPS Location ─────────────────────────────────────────
export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  timestamp?: number;
  address?: string;
}

// ─── API Response ─────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Auth ─────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  employee?: Employee;
  company?: Company;
}

// ─── Company Settings ─────────────────────────────────────
export interface CompanySettings {
  id: string;
  company_id: string;
  attendance_radius: number;
  allow_remote_checkin: boolean;
  require_photo_checkin: boolean;
  auto_checkout_time?: string;
  ai_report_audit: boolean;
  ai_score_threshold: number;
  notify_director_on_flag: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  whatsapp_notifications: boolean;
  work_week_start: string;
  weekend_days: string[];
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

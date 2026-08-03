// src/types/database.ts
// Auto-generated Supabase DB type stubs

export type Database = {
  public: {
    Tables: {
      companies: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      branches: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      employees: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      attendance: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      tasks: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      daily_reports: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      leaves: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      notifications: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

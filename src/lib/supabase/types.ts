// Hand-written types matching the Supabase schema in supabase/migrations/0001_init.sql.
// We don't run the supabase type generator yet — keep this in sync manually.

import { UserPlan } from "@/types";

export type UserRole = "user" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  plan: UserPlan;
  role: UserRole;
  banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminUserStats extends Profile {
  total_slips_exported: number;
  total_ai_runs: number;
  last_active_at: string | null;
}

export interface SlipEvent {
  id: number;
  user_id: string;
  event_type: "export" | "ai_process";
  slip_count: number;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: number;
  actor_id: string;
  target_id: string | null;
  action: string;
  before_value: unknown;
  after_value: unknown;
  created_at: string;
}

// The shape we hand to `createClient<Database>(...)` so query builders know table types.
// The `__InternalSupabase` marker mirrors Supabase's generated types — without it the helpers
// short-circuit to `never` for table rows.
export type Database = {
  __InternalSupabase: { PostgrestVersion: "12" };
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string; email: string }; Update: Partial<Profile>; Relationships: [] };
      slip_events: { Row: SlipEvent; Insert: Omit<SlipEvent, "id" | "created_at"> & { created_at?: string }; Update: Partial<SlipEvent>; Relationships: [] };
      audit_log: { Row: AuditLogEntry; Insert: Omit<AuditLogEntry, "id" | "created_at"> & { created_at?: string }; Update: Partial<AuditLogEntry>; Relationships: [] };
    };
    Views: {
      admin_user_stats: { Row: AdminUserStats; Relationships: [] };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

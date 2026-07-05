export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type LogTab = 'morning' | 'daily' | 'night' | 'stretch' | 'weekly';
export type WeightUnit = 'kg' | 'lbs';

export interface ThresholdDef {
  value: number;
  direction: 'min' | 'max';
  unit?: string;
}

export interface Database {
  public: {
    Tables: {
      daily_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          morning: Record<string, boolean | number | null>;
          daily: Record<string, boolean | number | null>;
          night: Record<string, boolean | number | null>;
          stretch: Record<string, boolean | number | null>;
          weekly: Record<string, boolean | number | null>;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          date: string;
          morning?: Record<string, boolean | number | null>;
          daily?: Record<string, boolean | number | null>;
          night?: Record<string, boolean | number | null>;
          stretch?: Record<string, boolean | number | null>;
          weekly?: Record<string, boolean | number | null>;
        };
        Update: Partial<Database['public']['Tables']['daily_logs']['Insert']>;
      };
      training_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_date: string;
          session_time: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          session_date: string;
          session_time?: string;
          notes?: string | null;
        };
        Update: Partial<Database['public']['Tables']['training_sessions']['Insert']>;
      };
      muscle_groups: {
        Row: { id: string; user_id: string; name: string; created_at: string };
        Insert: { user_id: string; name: string };
        Update: { name?: string };
      };
      exercises: {
        Row: { id: string; user_id: string; muscle_group_id: string; name: string; created_at: string };
        Insert: { user_id: string; muscle_group_id: string; name: string };
        Update: { name?: string };
      };
      gyms: {
        Row: { id: string; user_id: string; name: string; created_at: string };
        Insert: { user_id: string; name: string };
        Update: { name?: string };
      };
      exercise_logs: {
        Row: { id: string; session_id: string; exercise_id: string; gym_id: string; created_at: string };
        Insert: { session_id: string; exercise_id: string; gym_id: string };
        Update: never;
      };
      sets: {
        Row: {
          id: string;
          exercise_log_id: string;
          set_index: number;
          weight: number;
          weight_unit: WeightUnit;
          reps: number;
          created_at: string;
        };
        Insert: {
          exercise_log_id: string;
          set_index: number;
          weight: number;
          weight_unit: WeightUnit;
          reps: number;
        };
        Update: { weight?: number; weight_unit?: WeightUnit; reps?: number; set_index?: number };
      };
      settings: {
        Row: {
          user_id: string;
          sleep_target_hours: number;
          primary_weight_unit: WeightUnit;
          thresholds: Record<string, ThresholdDef>;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          sleep_target_hours?: number;
          primary_weight_unit?: WeightUnit;
          thresholds?: Record<string, ThresholdDef>;
        };
        Update: {
          sleep_target_hours?: number;
          primary_weight_unit?: WeightUnit;
          thresholds?: Record<string, ThresholdDef>;
        };
      };
    };
  };
}

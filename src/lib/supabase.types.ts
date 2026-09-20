export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string;
          name: string;
          file_name: string;
          storage_path: string | null;
          duration: number | null;
          status: string;
          risk_level: string | null;
          risk_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          file_name: string;
          storage_path?: string | null;
          duration?: number | null;
          status?: string;
          risk_level?: string | null;
          risk_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['videos']['Insert']>;
        Relationships: [];
      };
      moderation_results: {
        Row: {
          id: string;
          video_id: string;
          processing_job_id: string | null;
          source: string;
          status: string;
          risk_level: string | null;
          risk_score: number | null;
          summary: Json;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          video_id: string;
          processing_job_id?: string | null;
          source: string;
          status?: string;
          risk_level?: string | null;
          risk_score?: number | null;
          summary?: Json;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['moderation_results']['Insert']>;
        Relationships: [];
      };
      moderation_events: {
        Row: {
          id: string;
          video_id: string;
          moderation_result_id: string | null;
          chunk_id: number;
          start_seconds: number;
          end_seconds: number;
          timecode: string;
          modality: string;
          threat: string;
          score: number;
          action: string;
          confidence: number;
          reviewed: boolean;
          reason: string;
          signals: Json;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['moderation_events']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['moderation_events']['Insert']>;
        Relationships: [];
      };
      review_tasks: {
        Row: {
          id: string;
          event_id: string;
          status: string;
          reviewer_id: string | null;
          decision_action: string | null;
          decision_source: string | null;
          decision_reason: string | null;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['review_tasks']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['review_tasks']['Insert']>;
        Relationships: [];
      };
      model_versions: {
        Row: {
          id: string;
          name: string;
          version: string;
          modality: string;
          status: string;
          deployment: string;
          metrics: Json;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['model_versions']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['model_versions']['Insert']>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
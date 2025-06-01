export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
        };
      };
      pages: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          title: string;
          emoji: string | null;
          cover_url: string | null;
          user_id: string;
          parent_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          emoji?: string | null;
          cover_url?: string | null;
          user_id: string;
          parent_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
          emoji?: string | null;
          cover_url?: string | null;
          user_id?: string;
          parent_id?: string | null;
        };
      };
      blocks: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          type: string;
          content: Json;
          page_id: string;
          position: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          type: string;
          content: Json;
          page_id: string;
          position: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          type?: string;
          content?: Json;
          page_id?: string;
          position?: number;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
} 
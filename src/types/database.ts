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
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string | null;
        };
      };
      pages: {
        Row: {
          id: string;
          title: string;
          content: Record<string, any>;
          is_favorite: boolean;
          is_private: boolean;
          owner_id: string;
          parent_page_id: string | null;
          created_at: string;
          updated_at: string;
          last_edited_by: string | null;
          theme: string | null;
          icon: string | null;
          emoji: string | null;
          slug: string;
        };
        Insert: {
          id?: string;
          title?: string;
          content?: Record<string, any>;
          is_favorite?: boolean;
          is_private?: boolean;
          owner_id: string;
          parent_page_id?: string | null;
          created_at?: string;
          updated_at?: string;
          last_edited_by?: string | null;
          theme?: string | null;
          icon?: string | null;
          emoji?: string | null;
          slug?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: Record<string, any>;
          is_favorite?: boolean;
          is_private?: boolean;
          owner_id?: string;
          parent_page_id?: string | null;
          created_at?: string;
          updated_at?: string;
          last_edited_by?: string | null;
          theme?: string | null;
          icon?: string | null;
          emoji?: string | null;
          slug?: string;
        };
      };
      page_collaborators: {
        Row: {
          page_id: string;
          user_id: string;
          permission_level: string;
          created_at: string;
        };
        Insert: {
          page_id: string;
          user_id: string;
          permission_level?: string;
          created_at?: string;
        };
        Update: {
          page_id?: string;
          user_id?: string;
          permission_level?: string;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          page_id: string;
          author_id: string;
          content: string;
          created_at: string;
          updated_at: string;
          parent_comment_id: string | null;
          resolved: boolean;
        };
        Insert: {
          id?: string;
          page_id: string;
          author_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
          parent_comment_id?: string | null;
          resolved?: boolean;
        };
        Update: {
          id?: string;
          page_id?: string;
          author_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
          parent_comment_id?: string | null;
          resolved?: boolean;
        };
      };
      page_versions: {
        Row: {
          id: string;
          page_id: string;
          content: Record<string, any>;
          title: string;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          content: Record<string, any>;
          title: string;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          page_id?: string;
          content?: Record<string, any>;
          title?: string;
          created_at?: string;
          created_by?: string;
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
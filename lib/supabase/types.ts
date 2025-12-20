export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          plan: 'free' | 'pro' | 'enterprise'
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          plan?: 'free' | 'pro' | 'enterprise'
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          plan?: 'free' | 'pro' | 'enterprise'
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      signals: {
        Row: {
          id: string
          pair: string
          action: 'LONG' | 'SHORT'
          entry_price: number
          take_profit: number
          stop_loss: number
          status: 'draft' | 'active' | 'closed'
          profit_loss: number | null
          notes: string | null
          created_by: string
          ai_generated: boolean
          created_at: string
          updated_at: string
          closed_at: string | null
        }
        Insert: {
          id?: string
          pair: string
          action: 'LONG' | 'SHORT'
          entry_price: number
          take_profit: number
          stop_loss: number
          status?: 'draft' | 'active' | 'closed'
          profit_loss?: number | null
          notes?: string | null
          created_by: string
          ai_generated?: boolean
          created_at?: string
          updated_at?: string
          closed_at?: string | null
        }
        Update: {
          id?: string
          pair?: string
          action?: 'LONG' | 'SHORT'
          entry_price?: number
          take_profit?: number
          stop_loss?: number
          status?: 'draft' | 'active' | 'closed'
          profit_loss?: number | null
          notes?: string | null
          created_by?: string
          ai_generated?: boolean
          created_at?: string
          updated_at?: string
          closed_at?: string | null
        }
      }
      content: {
        Row: {
          id: string
          title: string
          description: string | null
          type: 'course' | 'video' | 'article' | 'tutorial'
          status: 'draft' | 'published' | 'scheduled'
          content_body: string | null
          thumbnail_url: string | null
          video_url: string | null
          views: number
          author_id: string
          ai_generated: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type: 'course' | 'video' | 'article' | 'tutorial'
          status?: 'draft' | 'published' | 'scheduled'
          content_body?: string | null
          thumbnail_url?: string | null
          video_url?: string | null
          views?: number
          author_id: string
          ai_generated?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: 'course' | 'video' | 'article' | 'tutorial'
          status?: 'draft' | 'published' | 'scheduled'
          content_body?: string | null
          thumbnail_url?: string | null
          video_url?: string | null
          views?: number
          author_id?: string
          ai_generated?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          thumbnail_url: string | null
          price: number
          status: 'draft' | 'published'
          lessons_count: number
          duration_minutes: number
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          author_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          thumbnail_url?: string | null
          price?: number
          status?: 'draft' | 'published'
          lessons_count?: number
          duration_minutes?: number
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          author_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          thumbnail_url?: string | null
          price?: number
          status?: 'draft' | 'published'
          lessons_count?: number
          duration_minutes?: number
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          author_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      course_lessons: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          video_url: string | null
          content_body: string | null
          order_index: number
          duration_minutes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          video_url?: string | null
          content_body?: string | null
          order_index: number
          duration_minutes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          video_url?: string | null
          content_body?: string | null
          order_index?: number
          duration_minutes?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          course_id: string
          lesson_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          lesson_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          lesson_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
      }
      ai_tasks: {
        Row: {
          id: string
          agent_type: 'content_creator' | 'signal_analyst' | 'social_manager' | 'course_builder' | 'support_agent'
          task_description: string
          status: 'pending' | 'in_progress' | 'completed' | 'failed'
          result: Json | null
          created_by: string
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          agent_type: 'content_creator' | 'signal_analyst' | 'social_manager' | 'course_builder' | 'support_agent'
          task_description: string
          status?: 'pending' | 'in_progress' | 'completed' | 'failed'
          result?: Json | null
          created_by: string
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          agent_type?: 'content_creator' | 'signal_analyst' | 'social_manager' | 'course_builder' | 'support_agent'
          task_description?: string
          status?: 'pending' | 'in_progress' | 'completed' | 'failed'
          result?: Json | null
          created_by?: string
          created_at?: string
          completed_at?: string | null
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          name: string | null
          status: 'active' | 'unsubscribed' | 'bounced'
          source: string
          subscribed_at: string
          unsubscribed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          status?: 'active' | 'unsubscribed' | 'bounced'
          source?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          status?: 'active' | 'unsubscribed' | 'bounced'
          source?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          created_at?: string
        }
      }
      support_tickets: {
        Row: {
          id: string
          name: string
          email: string
          subject: string
          message: string
          user_id: string | null
          status: 'open' | 'in_progress' | 'resolved' | 'closed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          subject: string
          message: string
          user_id?: string | null
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          subject?: string
          message?: string
          user_id?: string | null
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      plan_type: 'free' | 'pro' | 'enterprise'
      signal_action: 'LONG' | 'SHORT'
      signal_status: 'draft' | 'active' | 'closed'
      content_type: 'course' | 'video' | 'article' | 'tutorial'
      content_status: 'draft' | 'published' | 'scheduled'
      difficulty_level: 'beginner' | 'intermediate' | 'advanced'
      agent_type: 'content_creator' | 'signal_analyst' | 'social_manager' | 'course_builder' | 'support_agent'
      task_status: 'pending' | 'in_progress' | 'completed' | 'failed'
      ticket_status: 'open' | 'in_progress' | 'resolved' | 'closed'
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Signal = Database['public']['Tables']['signals']['Row']
export type Content = Database['public']['Tables']['content']['Row']
export type Course = Database['public']['Tables']['courses']['Row']
export type CourseLesson = Database['public']['Tables']['course_lessons']['Row']
export type UserProgress = Database['public']['Tables']['user_progress']['Row']
export type AITask = Database['public']['Tables']['ai_tasks']['Row']
export type SupportTicket = Database['public']['Tables']['support_tickets']['Row']

export interface NewsletterSubscriber {
  id: string
  email: string
  name: string | null
  status: 'active' | 'unsubscribed' | 'bounced'
  source: string
  subscribed_at: string
  unsubscribed_at: string | null
  created_at: string
}

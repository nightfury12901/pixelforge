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
          tier: 'free' | 'starter' | 'pro' | 'lifetime'
          credits_remaining: number
          credits_reset_date: string
          razorpay_subscription_id: string | null
          razorpay_customer_id: string | null
          subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due'
          chrome_extension_installed: boolean
          extension_prompts_today: number
          extension_prompts_reset_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          tier?: 'free' | 'starter' | 'pro' | 'lifetime'
          credits_remaining?: number
          credits_reset_date?: string
          razorpay_subscription_id?: string | null
          razorpay_customer_id?: string | null
          subscription_status?: 'active' | 'inactive' | 'cancelled' | 'past_due'
          chrome_extension_installed?: boolean
          extension_prompts_today?: number
          extension_prompts_reset_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          tier?: 'free' | 'starter' | 'pro' | 'lifetime'
          credits_remaining?: number
          credits_reset_date?: string
          razorpay_subscription_id?: string | null
          razorpay_customer_id?: string | null
          subscription_status?: 'active' | 'inactive' | 'cancelled' | 'past_due'
          chrome_extension_installed?: boolean
          extension_prompts_today?: number
          extension_prompts_reset_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      portrait_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          preview_image_url: string
          prompt_template: string
          category: 'professional' | 'indian' | 'lifestyle' | 'artistic' | 'trending'
          tier: 'free' | 'starter' | 'pro'
          is_trending: boolean
          is_new: boolean
          is_published: boolean
          popularity_score: number
          usage_count: number
          instagram_example_urls: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          preview_image_url: string
          prompt_template: string
          category: 'professional' | 'indian' | 'lifestyle' | 'artistic' | 'trending'
          tier?: 'free' | 'starter' | 'pro'
          is_trending?: boolean
          is_new?: boolean
          is_published?: boolean
          popularity_score?: number
          usage_count?: number
          instagram_example_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          preview_image_url?: string
          prompt_template?: string
          category?: 'professional' | 'indian' | 'lifestyle' | 'artistic' | 'trending'
          tier?: 'free' | 'starter' | 'pro'
          is_trending?: boolean
          is_new?: boolean
          is_published?: boolean
          popularity_score?: number
          usage_count?: number
          instagram_example_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      generations: {
        Row: {
          id: string
          user_id: string
          operation_type: 'portrait' | 'enhance' | 'background_remove'
          template_id: string | null
          input_image_url: string | null
          output_image_url: string | null
          metadata: Json | null
          credits_used: number
          processing_time_ms: number | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          operation_type: 'portrait' | 'enhance' | 'background_remove'
          template_id?: string | null
          input_image_url?: string | null
          output_image_url?: string | null
          metadata?: Json | null
          credits_used?: number
          processing_time_ms?: number | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          operation_type?: 'portrait' | 'enhance' | 'background_remove'
          template_id?: string | null
          input_image_url?: string | null
          output_image_url?: string | null
          metadata?: Json | null
          credits_used?: number
          processing_time_ms?: number | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          credits_used: number
          operation_type: 'portrait' | 'enhance' | 'background_remove' | 'prompt_extract'
          template_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          credits_used: number
          operation_type: 'portrait' | 'enhance' | 'background_remove' | 'prompt_extract'
          template_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          credits_used?: number
          operation_type?: 'portrait' | 'enhance' | 'background_remove' | 'prompt_extract'
          template_id?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          razorpay_payment_id: string | null
          razorpay_order_id: string | null
          razorpay_subscription_id: string | null
          amount: number
          currency: string
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          tier: 'starter' | 'pro' | 'lifetime' | null
          payment_type: 'subscription' | 'one_time'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          razorpay_payment_id?: string | null
          razorpay_order_id?: string | null
          razorpay_subscription_id?: string | null
          amount: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          tier?: 'starter' | 'pro' | 'lifetime' | null
          payment_type?: 'subscription' | 'one_time'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          razorpay_payment_id?: string | null
          razorpay_order_id?: string | null
          razorpay_subscription_id?: string | null
          amount?: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          tier?: 'starter' | 'pro' | 'lifetime' | null
          payment_type?: 'subscription' | 'one_time'
          created_at?: string
        }
      }
      template_usage: {
        Row: {
          id: string
          template_id: string
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          user_id?: string | null
          created_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          key_hash: string
          key_prefix: string
          name: string | null
          calls_made: number
          calls_limit: number
          last_used_at: string | null
          is_active: boolean
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          key_hash: string
          key_prefix: string
          name?: string | null
          calls_made?: number
          calls_limit?: number
          last_used_at?: string | null
          is_active?: boolean
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          key_hash?: string
          key_prefix?: string
          name?: string | null
          calls_made?: number
          calls_limit?: number
          last_used_at?: string | null
          is_active?: boolean
          created_at?: string
          expires_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reset_monthly_credits: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
      reset_extension_prompts: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

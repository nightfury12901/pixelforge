// User and profile types
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  tier: 'free' | 'starter' | 'creator' | 'pro';
  credits_remaining: number;
  credits_reset_date: string;
  razorpay_subscription_id: string | null;
  razorpay_customer_id: string | null;
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  chrome_extension_installed: boolean;
  extension_prompts_today: number;
  extension_prompts_reset_date: string;
  created_at: string;
  updated_at: string;
}

// Template types
export interface PortraitTemplate {
  id: string;
  name: string;
  description: string | null;
  preview_image_url: string;
  prompt_template: string;
  category: 'professional' | 'indian' | 'lifestyle' | 'artistic' | 'trending';
  tier: 'free' | 'starter' | 'pro';
  is_trending: boolean;
  is_new: boolean;
  is_published: boolean;
  popularity_score: number;
  usage_count: number;
  aspect_ratio: string | null;
  mask_image: string | null;
  instagram_example_urls: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateCategory {
  id: string;
  label: string;
  icon: string;
}

// Generation types
export interface Generation {
  id: string;
  user_id: string;
  operation_type: 'portrait' | 'enhance' | 'background_remove' | 'beautify';
  template_id: string | null;
  template?: PortraitTemplate;
  input_image_url: string | null;
  output_image_url: string | null;
  metadata: Record<string, any> | null;
  credits_used: number;
  processing_time_ms: number | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// Credit types
export interface CreditTransaction {
  id: string;
  user_id: string;
  credits_used: number;
  operation_type: 'portrait' | 'enhance' | 'background_remove' | 'beautify' | 'prompt_extract';
  template_id: string | null;
  created_at: string;
}

// Payment types
export interface Payment {
  id: string;
  user_id: string;
  razorpay_payment_id: string | null;
  razorpay_order_id: string | null;
  razorpay_subscription_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  tier: 'starter' | 'creator' | 'pro' | null;
  payment_type: 'subscription' | 'one_time';
  created_at: string;
}

// Pricing types
export interface PricingTier {
  id: 'starter' | 'creator' | 'pro';
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'one-time' | null;
  credits: number;
  features: string[];
  popular?: boolean;
  razorpay_plan_id?: string;
}

// API types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GenerationRequest {
  template_id: string;
  image_base64: string;
}

export interface GenerationResponse {
  generation_id: string;
  status: 'pending' | 'processing';
  message: string;
}

export interface GenerationStatusResponse {
  generation: Generation;
  output_url: string | null;
}

// Extension types
export interface ExtensionMessage {
  type: 'GET_PROMPT' | 'SYNC_USER' | 'CHECK_CREDITS';
  payload?: any;
}

export interface ExtensionPromptResponse {
  prompt: string;
  prompts_remaining: number;
  upgrade_url: string;
}

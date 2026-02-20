import { PricingTier, TemplateCategory } from './types';

// App constants
export const APP_NAME = 'PixelForge AI';
export const APP_TAGLINE = 'AI Portrait Generator, Image Enhancer & Background Remover';
export const APP_DESCRIPTION =
  'Create viral AI portraits in 25+ Instagram-trending styles. Used by 10,000+ creators. Free Chrome extension + powerful web tools.';

// SEO
export const SEO_KEYWORDS = [
  'AI portrait generator',
  'AI headshot generator India',
  'Instagram AI portraits',
  'free AI image enhancer',
  'AI photo upscaler online',
  'trending AI portraits',
  'Midjourney portrait styles',
  'Instagram photo enhancer',
  'LinkedIn headshot AI',
];

// Credits
export const CREDITS_CONFIG = {
  free: 20,
  starter: 500,
  creator: 1500,
  pro: 5000,
  lifetime: 300,
};

export const OPERATION_COSTS = {
  portrait: 5,
  enhance: 3,
  background_remove: 3,
  prompt_extract: 0,    // Free via extension
  thumbnail: 3,
  image_gen: 2,         // FLUX via fal.ai
  image_edit: 10,       // SeeDream v4.5 via fal.ai
  ad_gen: 5,            // Groq - very cheap
  video_5s: 60,         // Kling 2.1 5-second video
  video_10s: 110,       // Kling 2.1 10-second video
};

// Extension limits
export const EXTENSION_DAILY_LIMIT = 10;

// Pricing tiers (India-optimized)
export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Explore PixelForge AI at no cost',
    price: 0,
    currency: 'INR',
    interval: null,
    credits: 20,
    features: [
      '20 credits/month',
      '5 free templates',
      '1080p resolution',
      'Chrome extension (10 prompts/day)',
      'Community support',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For creators and freelancers',
    price: 149,
    currency: 'INR',
    interval: 'month',
    credits: 500,
    features: [
      '500 credits/month',
      'All templates unlocked',
      'No watermark',
      '2K resolution',
      'Images, portraits, thumbnails',
      'Email support',
    ],
    popular: true,
    razorpay_plan_id: process.env.NEXT_PUBLIC_RAZORPAY_STARTER_PLAN_ID,
  },
  {
    id: 'creator',
    name: 'Creator',
    description: 'For content teams and agencies',
    price: 399,
    currency: 'INR',
    interval: 'month',
    credits: 1500,
    features: [
      '1,500 credits/month',
      'Everything in Starter',
      'AI Video Generation (Kling 2.1)',
      '4K resolution',
      'Priority processing',
      'Chat support',
    ],
    razorpay_plan_id: process.env.NEXT_PUBLIC_RAZORPAY_CREATOR_PLAN_ID,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For power users and studios',
    price: 999,
    currency: 'INR',
    interval: 'month',
    credits: 5000,
    features: [
      '5,000 credits/month',
      'Everything in Creator',
      'Batch processing',
      'API access',
      'Priority support',
      'Custom templates on request',
    ],
    razorpay_plan_id: process.env.NEXT_PUBLIC_RAZORPAY_PRO_PLAN_ID,
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    description: 'One-time payment, forever access',
    price: 4999,
    currency: 'INR',
    interval: 'one-time',
    credits: 300,
    features: [
      '300 credits/month forever',
      'All Pro features',
      'Lifetime updates',
      'No recurring fees',
      'Early access to new features',
    ],
  },
];

// Template categories
export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { id: 'all', label: 'All Templates', icon: '' },
  { id: 'trending', label: 'Trending', icon: '' },
  { id: 'professional', label: 'Professional', icon: '' },
  { id: 'indian', label: 'Religious', icon: '' },
  { id: 'lifestyle', label: 'Lifestyle', icon: '' },
  { id: 'artistic', label: 'Artistic', icon: '' },
];

// Image upload limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// API endpoints
export const API_ENDPOINTS = {
  credits: {
    check: '/api/credits/check',
    deduct: '/api/credits/deduct',
  },
  templates: {
    list: '/api/templates/list',
    upload: '/api/templates/upload',
    single: (id: string) => `/api/templates/${id}`,
  },
  tools: {
    portrait: '/api/tools/portrait',
    enhance: '/api/tools/enhance',
    backgroundRemove: '/api/tools/background-remove',
    promptExtract: '/api/tools/prompt-extract',
    status: '/api/tools/status',
  },
  user: {
    profile: '/api/user/profile',
    history: '/api/user/history',
  },
  payment: {
    createSubscription: '/api/payment/create-subscription',
    verify: '/api/payment/verify',
  },
};

// Rate limits
export const RATE_LIMITS = {
  free: {
    requests: 10,
    window: 60, // seconds
  },
  starter: {
    requests: 50,
    window: 60,
  },
  pro: {
    requests: 200,
    window: 60,
  },
  lifetime: {
    requests: 200,
    window: 60,
  },
};

// Social links
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/pixelforgeai',
  instagram: 'https://instagram.com/pixelforgeai',
  youtube: 'https://youtube.com/@pixelforgeai',
};

// Support
export const SUPPORT_EMAIL = 'support@pixelforge.ai';
export const CHROME_EXTENSION_URL = 'https://chrome.google.com/webstore/detail/pixelforge-ai/xxxxx';

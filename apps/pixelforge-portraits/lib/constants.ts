import { PricingTier, TemplateCategory } from './types';

// App constants
export const APP_NAME = 'AuraShot';
export const APP_TAGLINE = 'AI Portrait Generator, Image Enhancer & Background Remover';
export const APP_DESCRIPTION =
  'Create viral AI portraits in 25+ Instagram-trending styles. Free Chrome extension + powerful web tools.';

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

// Usage caps based on tiers (replacing old credits logic)
export const TIER_CAPS = {
  free: {
    portraits: 3, // Lifetime
    enhance: 0,
    background_remove: 0,
    beautify: 0,
    prompt_reversals: 10, // Daily
  },
  starter: {
    portraits: 5,
    enhance: 5,
    background_remove: 10,
    beautify: 0,
    prompt_reversals: 20, // Daily
  },
  creator: {
    portraits: 15,
    enhance: 15,
    background_remove: 25,
    beautify: 10,
    prompt_reversals: 50, // Daily
  },
  pro: {
    portraits: 40,
    enhance: 40,
    background_remove: 60,
    beautify: 30,
    prompt_reversals: 100, // Daily
  },
};

// Operation aliases
export const OPERATION_COSTS = {
  portrait: 1,
  enhance: 1,
  background_remove: 1,
  beautify: 1,
  prompt_extract: 1,
  thumbnail: 1,
  image_gen: 1,
  image_edit: 1,
  ad_gen: 1,
  video_5s: 1,
  video_10s: 2,
  batch_10: 10,
};

// Rate limits
export const RATE_LIMITS = {
  free: {
    requests: 20,
    window: 60, // seconds
  },
  starter: {
    requests: 100,
    window: 60,
  },
  creator: {
    requests: 150,
    window: 60,
  },
  pro: {
    requests: 200,
    window: 60,
  }
};

// Pricing tiers (India-optimized, One-Time)
export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter Tier',
    description: 'Portraits + Enhancement + BG Removal',
    price: 149,
    currency: 'INR',
    interval: 'one-time',
    credits: 5, // Legacy field
    features: [
      '5 AI Portraits',
      '5 Enhancements',
      '10 Background Removals',
      '20 Prompt Reversals/day',
    ],
  },
  {
    id: 'creator',
    name: 'Creator Tier',
    description: 'Perfect for regular content creators. Includes Beautification.',
    price: 299,
    currency: 'INR',
    interval: 'one-time',
    credits: 15, // Legacy field
    features: [
      '15 AI Portraits',
      '15 Enhancements',
      '25 Background Removals',
      '10 Beautifications',
      '50 Prompt Reversals/day',
      'Access to All Presets',
    ],
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro Tier',
    description: 'For heavy users and professionals. Maximum value.',
    price: 799,
    currency: 'INR',
    interval: 'one-time',
    credits: 40, // Legacy field
    features: [
      '40 AI Portraits',
      '40 Enhancements',
      '60 Background Removals',
      '30 Beautifications',
      '100 Prompt Reversals/day',
      'Priority Queue Processing',
      'Custom Prompts',
    ],
  }
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
    beautify: '/api/tools/beautify',
    backgroundRemove: '/api/tools/background-remove',
    promptExtract: '/api/tools/prompt-extract',
    status: '/api/tools/status',
  },
  user: {
    profile: '/api/user/profile',
    history: '/api/user/history',
  },
  payment: {
    createOrder: '/api/payment/create-order',
    verify: '/api/payment/verify',
  },
};

// Social links
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/aurashot',
  instagram: 'https://instagram.com/aurashot',
  youtube: 'https://youtube.com/@aurashot',
};

// Support
export const SUPPORT_EMAIL = 'support@aurashot.in';
export const CHROME_EXTENSION_URL = 'https://chrome.google.com/webstore/detail/aurashot-ai/xxxxx';

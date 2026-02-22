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
  free: 2, // Give a generous free tier of 2 credits for testers
  starter: 5,
  creator: 12,
  pro: 25,
};

export const OPERATION_COSTS = {
  portrait: 1,
  enhance: 0,         // FREE
  background_remove: 0, // FREE
  prompt_extract: 0,
  thumbnail: 1,
  image_gen: 1,
  image_edit: 1,
  ad_gen: 1,
  video_5s: 1,
  video_10s: 2,
  batch_10: 10,       // Batch costs 1 per image
};

// Extension limits
export const EXTENSION_DAILY_LIMIT = 10;

// Pricing tiers (India-optimized, One-Time)
export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter Packs',
    description: 'Entry-level impulse buy, good for testing quality',
    price: 199,
    currency: 'INR',
    interval: 'one-time',
    credits: 5,
    features: [
      '5 Portrait Generations',
      '1 Curated Preset',
      'Standard Resolution Export',
      'No 4K Export',
      'No Batch Processing',
    ],
  },
  {
    id: 'creator',
    name: 'Creator Pack',
    description: 'Best value, feels like a deal, high perceived value',
    price: 299,
    currency: 'INR',
    interval: 'one-time',
    credits: 12,
    features: [
      '12 Portrait Generations',
      'Access to All Presets',
      '4K Export Included',
      'Background Removal Included',
    ],
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    description: 'For heavy users, protects margins, increases AOV',
    price: 499,
    currency: 'INR',
    interval: 'one-time',
    credits: 25,
    features: [
      '25 Portrait Generations',
      'Access to All Presets',
      '4K Export Included',
      'Background Removal Included',
      'Batch processing (up to 10 images)',
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

// Rate limits
export const RATE_LIMITS = {
  free: {
    requests: 10,
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

// Social links
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/pixelforgeai',
  instagram: 'https://instagram.com/pixelforgeai',
  youtube: 'https://youtube.com/@pixelforgeai',
};

// Support
export const SUPPORT_EMAIL = 'support@pixelforge.ai';
export const CHROME_EXTENSION_URL = 'https://chrome.google.com/webstore/detail/pixelforge-ai/xxxxx';

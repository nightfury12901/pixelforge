'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PortraitTemplate } from '@/lib/types';
import Link from 'next/link';

interface TemplateCardProps {
  template: PortraitTemplate;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const cardContent = (
    <div
      className={`group relative rounded-2xl overflow-hidden bg-gray-900/50
                 transition-transform duration-200 ease-out cursor-pointer hover:-translate-y-0.5`}
      style={{
        aspectRatio: (template.aspect_ratio || '3:4').replace(':', '/'),
        contentVisibility: 'auto',
        containIntrinsicSize: '0 400px',
      } as React.CSSProperties}
    >
      {/* Template Preview Image */}
      <Image
        src={template.preview_image_url}
        alt={template.name}
        fill
        loading="lazy"
        quality={60}
        className={`object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]`}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

      {/* Badges */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5">
        {template.is_trending && (
          <Badge variant="trending" className="bg-orange-500/90 text-white border-0 shadow-sm text-[10px]">
            🔥 Trending
          </Badge>
        )}
        {template.is_new && (
          <Badge variant="new" className="bg-blue-500/90 text-white border-0 shadow-sm text-[10px]">
            ✨ New
          </Badge>
        )}
        {template.tier === 'pro' && (
          <Badge variant="pro" className="bg-purple-500/90 text-white border-0 shadow-sm text-[10px]">
            👑 Pro
          </Badge>
        )}
        {template.tier === 'free' && (
          <Badge variant="free" className="bg-green-500/90 text-white border-0 shadow-sm text-[10px]">
            Free
          </Badge>
        )}
      </div>

      {/* Template Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="text-white font-semibold text-sm mb-0.5 line-clamp-1">
          {template.name}
        </h3>
        {template.usage_count > 0 && (
          <p className="text-white/50 text-[11px] mb-2">
            {formatNumber(template.usage_count)} creators
          </p>
        )}

        {/* Try Button */}
        <Button
          size="sm"
          className="w-full opacity-0 group-hover:opacity-100 transition-opacity duration-200
                     bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm
                     text-xs h-7"
        >
          Try this style →
        </Button>
      </div>
    </div>
  );

  return (
    <Link href={`/dashboard/generate/${template.id}`} prefetch={false} className="block group">
      {cardContent}
    </Link>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

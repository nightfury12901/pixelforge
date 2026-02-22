'use client';

import { useState, useEffect, useMemo } from 'react';
import { TemplateCard } from './TemplateCard';
import { CategoryFilter } from './CategoryFilter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import type { PortraitTemplate } from '@/lib/types';

interface TemplateGalleryProps {
  /** If provided, the gallery uses these templates (no internal fetch) */
  templates?: PortraitTemplate[];
}

export function TemplateGallery({ templates: externalTemplates }: TemplateGalleryProps) {
  const [internalTemplates, setInternalTemplates] = useState<PortraitTemplate[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(!externalTemplates);

  // Only fetch when no external templates are supplied
  useEffect(() => {
    if (externalTemplates) return;
    fetchTemplates();
  }, [selectedCategory, externalTemplates]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset visible count on filter/search change
  useEffect(() => {
    setVisibleCount(12);
  }, [debouncedQuery, selectedCategory]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/templates/list?category=${selectedCategory}&sort=popularity`
      );
      const data = await response.json();
      if (data.success) setInternalTemplates(data.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use external templates if provided, otherwise use internally fetched ones
  const templates = externalTemplates ?? internalTemplates;

  // Filter by category (when using external templates) + search
  const filteredTemplates = useMemo(() => {
    let result = templates;

    // If we have external templates, filter by category client-side
    if (externalTemplates && selectedCategory !== 'all') {
      result = result.filter((t) => t.category === selectedCategory);
    }

    if (!debouncedQuery.trim()) return result;
    const q = debouncedQuery.toLowerCase();
    return result.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [templates, externalTemplates, selectedCategory, debouncedQuery]);

  const visibleTemplates = filteredTemplates.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTemplates.length;

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
          <Input
            type="search"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 bg-white/[0.04] border-white/[0.08] placeholder:text-white/30 focus:border-violet-500/50 text-sm"
          />
        </div>

        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={(category) => {
            setSelectedCategory(category);
            setSearchQuery('');
            setVisibleCount(12);
          }}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl skeleton" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTemplates.length === 0 && (
        <div className="text-center py-20 animate-fadeInUp">
          <div className="text-5xl mb-4">🎨</div>
          <h3 className="text-lg font-semibold text-white/70 mb-1">No templates found</h3>
          <p className="text-sm text-white/40">
            {searchQuery ? 'Try a different search term' : 'No templates in this category yet'}
          </p>
        </div>
      )}

      {/* Template Grid — CSS Grid, no JS animation per card */}
      {!loading && visibleTemplates.length > 0 && (
        <>
          {/*
            CSS Grid instead of CSS columns:
            - No reflow cascade on new items
            - Browser can skip off-screen rows via content-visibility on cards
            - Deterministic layout = no layout thrashing during scroll
          */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                size="default"
                onClick={() => setVisibleCount((prev) => prev + 12)}
                className="min-w-[140px] border-white/10 text-white/60 hover:text-white hover:border-white/20"
              >
                Load More ({filteredTemplates.length - visibleCount} remaining)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

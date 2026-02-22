'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TEMPLATE_CATEGORIES } from '@/lib/constants';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <Tabs value={selectedCategory} onValueChange={onCategoryChange}>
      <TabsList className="w-full justify-start">
        {TEMPLATE_CATEGORIES.map((category) => (
          <TabsTrigger key={category.id} value={category.id} className="gap-2">
            <span>{category.icon}</span>
            <span className="hidden sm:inline">{category.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

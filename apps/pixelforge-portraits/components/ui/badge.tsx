import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary ring-primary/20',
        secondary: 'bg-secondary/10 text-secondary ring-secondary/20',
        success: 'bg-success/10 text-success ring-success/20',
        destructive: 'bg-destructive/10 text-destructive ring-destructive/20',
        trending: 'bg-red-50 text-red-600 ring-red-200',
        new: 'bg-yellow-50 text-yellow-600 ring-yellow-200',
        pro: 'bg-purple-50 text-purple-600 ring-purple-200',
        free: 'bg-green-50 text-green-600 ring-green-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

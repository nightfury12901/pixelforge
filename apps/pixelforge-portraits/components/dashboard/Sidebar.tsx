'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Home,
  Image as ImageIcon,
  History,
  Settings,
  Crown,
  CreditCard,
  Users,
  Wand2,
  Eraser,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreditsDisplay } from './CreditsDisplay';
import { cn } from '@/lib/utils';

const sidebarNav = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: Home,
  },
  {
    href: '/dashboard/portraits',
    label: 'Templates',
    icon: ImageIcon,
  },
  {
    href: '/dashboard/enhance',
    label: 'Enhance',
    icon: Wand2,
  },
  {
    href: '/dashboard/background',
    label: 'Background',
    icon: Eraser,
  },
  {
    href: '/dashboard/history',
    label: 'History',
    icon: History,
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-white shadow-sm border-r border-gray-100 h-screen sticky top-0 p-6 space-y-6 overflow-y-auto"
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center">
          <ImageIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">AuraShot</h1>
          <p className="text-xs text-muted-foreground">AI Portraits</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {sidebarNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start h-12 px-4 py-2 rounded-2xl gap-3',
                  isActive
                    ? 'bg-primary/5 border-primary text-primary shadow-sm'
                    : 'hover:bg-primary/5 hover:text-primary'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Credits Display */}
      <CreditsDisplay />

      {/* Upgrade CTA */}
      <div className="pt-6 border-t">
        <Button className="w-full" size="lg">
          <Crown className="h-5 w-5 mr-2" />
          Upgrade to Pro
        </Button>
      </div>
    </motion.aside>
  );
}

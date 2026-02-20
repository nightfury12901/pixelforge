import type { Metadata } from 'next';
import { StudioSidebar } from '@/components/dashboard/StudioSidebar';

export const metadata: Metadata = {
  title: 'Studio — PixelForge AI',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-studio-bg overflow-hidden">
      {/* Left Tool Dock */}
      <StudioSidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-w-0 scroll-smooth" style={{ overscrollBehaviorY: 'contain' }}>
        {children}
      </main>
    </div>
  );
}

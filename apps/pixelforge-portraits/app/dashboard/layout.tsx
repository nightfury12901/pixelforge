import type { Metadata } from 'next';
import { StudioSidebar } from '@/components/dashboard/StudioSidebar';
import { createClient } from '@/lib/supabase/server';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Studio — AuraShot',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let tier = 'free';

  if (user) {
    const { data } = await (supabase as any).from('profiles').select('tier').eq('id', user.id).single();
    if (data && data.tier) tier = data.tier;
  }

  return (
    <div className="flex h-screen bg-studio-bg overflow-hidden">
      {tier === 'free' && (
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      )}
      {/* Left Tool Dock */}
      <StudioSidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-w-0 scroll-smooth" style={{ overscrollBehaviorY: 'contain' }}>
        {children}
      </main>
    </div>
  );
}

'use client';

import React from 'react';
import { Layout } from 'antd';
import { usePathname } from 'next/navigation';
import NavRail from '@/components/Layout/NavRail';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  return (
    <Layout style={{ height: '100vh', background: 'transparent' }}>
      {/* Persistent navigation rail — never remounts on page switch */}
      <NavRail />
      {/* Page content — keyed by pathname to trigger transition animation */}
      <div
        key={pathname}
        className="page-enter"
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          // On mobile the NavRail is position:fixed at bottom, reserve space for it
          paddingBottom: isMobile ? 56 : 0,
        }}
      >
        {children}
      </div>
    </Layout>
  );
}

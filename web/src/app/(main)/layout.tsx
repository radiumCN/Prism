'use client';

import React from 'react';
import { Layout } from 'antd';
import { usePathname } from 'next/navigation';
import NavRail from '@/components/Layout/NavRail';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <Layout style={{ height: '100vh', background: 'transparent' }}>
      {/* Persistent navigation rail — never remounts on page switch */}
      <NavRail />
      {/* Page content — keyed by pathname to trigger transition animation */}
      <div
        key={pathname}
        className="page-enter"
        style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        {children}
      </div>
    </Layout>
  );
}

'use client';

import React from 'react';
import { Layout } from 'antd';

const { Sider, Content } = Layout;

interface Props {
  children: React.ReactNode;
  /** Optional secondary sidebar (e.g. conversation list in chat page) */
  sidebar?: React.ReactNode;
}

/**
 * Content-level layout wrapper.
 * The nav rail is handled by the (main) route group layout — do NOT add it here.
 */
export default function AppLayout({ children, sidebar }: Props) {
  return (
    <Layout style={{ flex: 1, overflow: 'hidden', background: 'transparent' }}>
      {sidebar && (
        <Sider
          width={240}
          style={{
            background: 'rgba(20,15,50,0.4)',
            backdropFilter: 'blur(16px)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {sidebar}
        </Sider>
      )}
      <Content style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </Content>
    </Layout>
  );
}

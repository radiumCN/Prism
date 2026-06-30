'use client';

import React, { useState } from 'react';
import { Layout, Drawer, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useIsMobile } from '@/hooks/useIsMobile';

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
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Layout style={{ flex: 1, overflow: 'hidden', background: 'transparent' }}>
      {/* Desktop: inline sidebar */}
      {!isMobile && sidebar && (
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

      {/* Mobile: sidebar as Drawer */}
      {isMobile && sidebar && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement="left"
          width={280}
          styles={{
            body: { padding: 0, background: 'rgba(15,12,41,0.96)' },
            header: { display: 'none' },
            wrapper: { boxShadow: '4px 0 24px rgba(0,0,0,0.5)' },
          }}
          style={{ zIndex: 300 }}
        >
          {/* Close drawer when any conversation item is tapped */}
          <div onClick={() => setDrawerOpen(false)} style={{ height: '100%' }}>
            {sidebar}
          </div>
        </Drawer>
      )}

      <Content style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Mobile: button to open the sidebar drawer */}
        {isMobile && sidebar && (
          <div
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              flexShrink: 0,
            }}
          >
            <Button
              size="small"
              icon={<MenuOutlined />}
              onClick={() => setDrawerOpen(true)}
              style={{
                color: 'rgba(255,255,255,0.7)',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
              }}
            >
              对话列表
            </Button>
          </div>
        )}
        {children}
      </Content>
    </Layout>
  );
}

'use client';

import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography } from 'antd';
import {
  MessageOutlined,
  PictureOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

const { Sider, Content } = Layout;
const { Text } = Typography;

interface Props {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export default function AppLayout({ children, sidebar }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const menuItems = [
    {
      key: '/chat',
      icon: <MessageOutlined />,
      label: '对话',
      onClick: () => router.push('/chat'),
    },
    {
      key: '/image',
      icon: <PictureOutlined />,
      label: '绘图',
      onClick: () => router.push('/image'),
    },
    ...(isAdmin
      ? [
          {
            key: '/admin',
            icon: <DashboardOutlined />,
            label: '管理',
            onClick: () => router.push('/admin'),
          },
        ]
      : []),
  ];

  const userMenuItems = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '个人设置',
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const selectedKey = menuItems.find((m) => pathname.startsWith(m.key))?.key || '/chat';

  return (
    <Layout style={{ height: '100vh', background: 'transparent' }}>
      {/* Left navigation rail */}
      <Sider
        width={64}
        style={{
          background: 'rgba(15,12,41,0.6)',
          backdropFilter: 'blur(16px)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 8,
          paddingBottom: 8,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', gap: 4 }}>
          {menuItems.map((item) => (
            <div
              key={item.key}
              onClick={item.onClick}
              style={{
                width: 44,
                height: 44,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                cursor: 'pointer',
                background: selectedKey === item.key ? 'rgba(124,58,237,0.25)' : 'transparent',
                border: selectedKey === item.key ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
                color: selectedKey === item.key ? '#a78bfa' : 'rgba(255,255,255,0.5)',
                fontSize: 18,
                transition: 'all 0.2s',
              }}
              className="glass-hover"
              title={item.label}
            >
              {item.icon}
            </div>
          ))}

          <div style={{ flex: 1 }} />

          {/* User avatar */}
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="topLeft"
            trigger={['click']}
          >
            <Avatar
              style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}
              icon={<UserOutlined />}
            />
          </Dropdown>
        </div>
      </Sider>

      {/* Optional sidebar (conversations list etc.) */}
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

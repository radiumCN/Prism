'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Avatar, Dropdown } from 'antd';
import {
  MessageOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import ProfileModal from './ProfileModal';

const { Sider } = Layout;

export default function NavRail() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  useEffect(() => setMounted(true), []);
  const isAdmin = mounted && user?.role === 'admin';

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const menuItems = [
    { key: '/chat', icon: <MessageOutlined />, label: '对话', onClick: () => router.push('/chat') },
    { key: '/image', icon: <PictureOutlined />, label: '绘图', onClick: () => router.push('/image') },
    { key: '/video', icon: <VideoCameraOutlined />, label: '视频', onClick: () => router.push('/video') },
    ...(isAdmin
      ? [{ key: '/admin', icon: <DashboardOutlined />, label: '管理', onClick: () => router.push('/admin') }]
      : []),
  ];

  const userMenuItems = [
    { key: 'settings', icon: <SettingOutlined />, label: '个人设置', onClick: () => setProfileOpen(true) },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
  ];

  const selectedKey = menuItems.find((m) => pathname.startsWith(m.key))?.key || '/chat';

  return (
    <>
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
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', gap: 4 }}>
        {menuItems.map((item) => (
          <div
            key={item.key}
            onClick={item.onClick}
            style={{
              width: 44, height: 44,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              borderRadius: 12, cursor: 'pointer',
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

        <Dropdown menu={{ items: userMenuItems }} placement="topLeft" trigger={['click']}>
          <Avatar
            style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}
            icon={<UserOutlined />}
          />
        </Dropdown>
      </div>
    </Sider>

    <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}

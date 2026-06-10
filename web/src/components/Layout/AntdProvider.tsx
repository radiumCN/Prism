'use client';

import React from 'react';
import { XProvider } from '@ant-design/x';
import { App, ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';

const glassTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#7c3aed',
    colorBgBase: 'transparent',
    colorBgContainer: 'rgba(255,255,255,0.06)',
    colorBgElevated: 'rgba(30,20,60,0.85)',
    colorBorder: 'rgba(255,255,255,0.12)',
    colorText: 'rgba(255,255,255,0.92)',
    colorTextSecondary: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
    borderRadiusLG: 16,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  components: {
    Layout: {
      bodyBg: 'transparent',
      siderBg: 'rgba(15,12,41,0.5)',
      headerBg: 'rgba(15,12,41,0.6)',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
    },
    Input: {
      colorBgContainer: 'rgba(255,255,255,0.06)',
      activeBorderColor: '#7c3aed',
    },
    Button: {
      defaultBg: 'rgba(255,255,255,0.08)',
      defaultBorderColor: 'rgba(255,255,255,0.15)',
    },
    Card: {
      colorBgContainer: 'rgba(255,255,255,0.06)',
    },
  },
};

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={glassTheme} locale={zhCN}>
      <App>
        <XProvider>{children}</XProvider>
      </App>
    </ConfigProvider>
  );
}

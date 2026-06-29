import type { Metadata } from 'next';
import './globals.css';
import '@ant-design/x-markdown/themes/dark.css';
import { AntdProvider } from '@/components/Layout/AntdProvider';

export const metadata: Metadata = {
  title: 'Prism',
  description: '统一 AI 能力的私有化部署平台',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdProvider>{children}</AntdProvider>
      </body>
    </html>
  );
}

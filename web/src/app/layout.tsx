import type { Metadata } from 'next';
import './globals.css';
import { AntdProvider } from '@/components/Layout/AntdProvider';

export const metadata: Metadata = {
  title: 'ModelHub',
  description: 'AI Model Aggregation Platform',
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

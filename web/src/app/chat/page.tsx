'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/Layout/AppLayout';
import ConversationSidebar from '@/components/Chat/ConversationSidebar';
import ChatInterface from '@/components/Chat/ChatInterface';
import { useAuthStore } from '@/store/auth';

export default function ChatPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const [activeConvKey, setActiveConvKey] = useState<string | undefined>();
  // Increment to trigger a sidebar reload (e.g. after new conversation created)
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  const conversationId = activeConvKey ? Number(activeConvKey) : null;

  const handleNewChat = () => {
    setActiveConvKey(undefined);
  };

  const handleConversationCreated = (id: number) => {
    setActiveConvKey(String(id));
    setSidebarRefreshKey((k) => k + 1);
  };

  if (!isAuthenticated) return null;

  return (
    <AppLayout
      sidebar={
        <ConversationSidebar
          activeKey={activeConvKey}
          onActiveChange={setActiveConvKey}
          onNewChat={handleNewChat}
          refreshKey={sidebarRefreshKey}
          onConversationDeleted={(id) => {
            if (activeConvKey === String(id)) setActiveConvKey(undefined);
          }}
        />
      }
    >
      <ChatInterface
        conversationId={conversationId}
        onConversationCreated={handleConversationCreated}
      />
    </AppLayout>
  );
}

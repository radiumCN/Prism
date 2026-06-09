'use client';

import React, { useEffect, useState } from 'react';
import { Conversations } from '@ant-design/x';
import type { ConversationsProps } from '@ant-design/x';
import { Button, Typography, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { api } from '@/lib/api';
import type { Conversation } from '@/types';

const { Text } = Typography;

interface Props {
  activeKey: string | undefined;
  onActiveChange: (key: string) => void;
  onNewChat: () => void;
}

export default function ConversationSidebar({ activeKey, onActiveChange, onNewChat }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const loadConversations = () => {
    setLoading(true);
    api
      .get<Conversation[]>('/conversations')
      .then(setConversations)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const items: ConversationsProps['items'] = conversations.map((c) => ({
    key: String(c.id),
    label: c.title || 'New Conversation',
  }));

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Text strong style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15 }}>
          ⚡ ModelHub
        </Text>
        <Button
          type="text"
          icon={<PlusOutlined />}
          onClick={onNewChat}
          style={{ color: 'rgba(255,255,255,0.6)' }}
        />
      </div>

      {/* Conversations list */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Spin size="small" />
          </div>
        ) : (
          <Conversations
            items={items}
            activeKey={activeKey}
            onActiveChange={onActiveChange}
          />
        )}
      </div>
    </div>
  );
}

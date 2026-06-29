'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Conversations } from '@ant-design/x';
import type { ConversationsProps } from '@ant-design/x';
import { Button, Typography, Spin, Modal, Input, App } from 'antd';
import { PlusOutlined, PushpinOutlined, PushpinFilled, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { api } from '@/lib/api';
import type { Conversation } from '@/types';

const { Text } = Typography;

interface Props {
  activeKey: string | undefined;
  onActiveChange: (key: string) => void;
  onNewChat: () => void;
  refreshKey?: number;
  onConversationDeleted?: (id: number) => void;
}

export default function ConversationSidebar({
  activeKey,
  onActiveChange,
  onNewChat,
  refreshKey = 0,
  onConversationDeleted,
}: Props) {
  const { message: antMessage } = App.useApp();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  // Rename modal state
  const [renaming, setRenaming] = useState<{ id: number; title: string } | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);

  const loadConversations = useCallback(() => {
    setLoading(true);
    api
      .get<Conversation[]>('/conversations')
      .then((list) => setConversations(list ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations, refreshKey]);

  const handlePin = async (conv: Conversation) => {
    const next = !conv.pinned;
    // Optimistic update
    setConversations((prev) =>
      [...prev.map((c) => (c.id === conv.id ? { ...c, pinned: next } : c))].sort(
        (a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) ||
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
    );
    try {
      await api.patch(`/conversations/${conv.id}`, { pinned: next });
    } catch {
      antMessage.error('操作失败');
      loadConversations();
    }
  };

  const openRename = (conv: Conversation) => {
    setRenaming({ id: conv.id, title: conv.title });
    setRenameValue(conv.title);
  };

  const submitRename = async () => {
    if (!renaming) return;
    const title = renameValue.trim();
    if (!title) return;
    setRenameLoading(true);
    try {
      await api.patch(`/conversations/${renaming.id}`, { title });
      setConversations((prev) =>
        prev.map((c) => (c.id === renaming.id ? { ...c, title } : c))
      );
      setRenaming(null);
    } catch {
      antMessage.error('重命名失败');
    } finally {
      setRenameLoading(false);
    }
  };

  const handleDelete = (conv: Conversation) => {
    Modal.confirm({
      title: '删除对话',
      content: `确定要删除「${conv.title}」吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await api.delete(`/conversations/${conv.id}`);
          setConversations((prev) => prev.filter((c) => c.id !== conv.id));
          onConversationDeleted?.(conv.id);
        } catch {
          antMessage.error('删除失败');
        }
      },
    });
  };

  const items: ConversationsProps['items'] = conversations.map((c) => ({
    key: String(c.id),
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {c.pinned && (
          <PushpinFilled style={{ fontSize: 11, color: '#a78bfa', flexShrink: 0 }} />
        )}
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {c.title || '新对话'}
        </span>
      </span>
    ),
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/icon.png" alt="Prism" style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover' }} />
          <Text strong style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15 }}>
            Prism
          </Text>
        </div>
        <Button
          type="text"
          icon={<PlusOutlined />}
          onClick={onNewChat}
          style={{ color: 'rgba(255,255,255,0.6)' }}
          title="新建对话"
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
            menu={(conv) => {
              const c = conversations.find((x) => String(x.id) === conv.key);
              return {
                items: [
                  {
                    key: 'pin',
                    icon: c?.pinned
                      ? <PushpinFilled style={{ color: '#a78bfa' }} />
                      : <PushpinOutlined />,
                    label: c?.pinned ? '取消置顶' : '置顶',
                  },
                  {
                    key: 'rename',
                    icon: <EditOutlined />,
                    label: '重命名',
                  },
                  { type: 'divider' as const },
                  {
                    key: 'delete',
                    icon: <DeleteOutlined />,
                    label: '删除',
                    danger: true,
                  },
                ],
                onClick: ({ key }) => {
                  if (!c) return;
                  if (key === 'pin') handlePin(c);
                  else if (key === 'rename') openRename(c);
                  else if (key === 'delete') handleDelete(c);
                },
              };
            }}
          />
        )}
      </div>

      {/* Rename modal */}
      <Modal
        title="重命名对话"
        open={renaming !== null}
        onOk={submitRename}
        onCancel={() => setRenaming(null)}
        confirmLoading={renameLoading}
        okText="保存"
        cancelText="取消"
      >
        <Input
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onPressEnter={submitRename}
          maxLength={100}
          placeholder="请输入对话名称"
          autoFocus
        />
      </Modal>
    </div>
  );
}

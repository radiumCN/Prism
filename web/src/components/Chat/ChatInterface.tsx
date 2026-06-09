'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Bubble,
  Sender,
  Welcome,
  Prompts,
  type PromptsProps,
} from '@ant-design/x';
import { useXChat } from '@ant-design/x-sdk';
import { Avatar, Select, Typography, Spin, theme } from 'antd';
import { RobotOutlined, UserOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { createChatProvider, type ChatMessage } from '@/lib/chatProvider';
import type { AIModel, Message } from '@/types';

const { Text } = Typography;

interface Props {
  conversationId: number | null;
  onConversationCreated?: (id: number) => void;
}

const PROMPTS: PromptsProps['items'] = [
  { key: '1', label: '介绍一下你自己' },
  { key: '2', label: '帮我写一段 Python 代码' },
  { key: '3', label: '解释一下量子计算' },
  { key: '4', label: '推荐几本好书' },
];

export default function ChatInterface({ conversationId, onConversationCreated }: Props) {
  const { token } = theme.useToken();
  const accessToken = useAuthStore((s) => s.accessToken) || '';
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Provider cache per conversation
  const providerRef = useRef<ReturnType<typeof createChatProvider> | null>(null);
  const convIdRef = useRef<number | null>(null);

  const provider = useMemo(() => {
    if (!conversationId) return null;
    if (convIdRef.current !== conversationId) {
      providerRef.current = createChatProvider(conversationId, accessToken, selectedModel ?? undefined);
      convIdRef.current = conversationId;
    }
    return providerRef.current!;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, accessToken]);

  const { messages, onRequest, isRequesting, abort, setMessages } = useXChat({
    provider: provider!,
    requestPlaceholder: () => ({ content: '', role: 'assistant' as const }),
    requestFallback: (_, { error, messageInfo }) => {
      if (error.name === 'AbortError') {
        return { content: messageInfo?.message?.content || '已取消', role: 'assistant' as const };
      }
      return { content: `请求失败: ${error.message}`, role: 'assistant' as const };
    },
  });

  useEffect(() => {
    api.get<AIModel[]>('/models?type=chat').then(setModels).catch(console.error);
  }, []);

  // Load history when conversation changes
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setIsLoading(true);
    api
      .get<Message[]>(`/conversations/${conversationId}`)
      .then((history) => {
        setMessages(
          history.map((m, i) => ({
            id: i,
            message: { content: m.content, role: m.role as 'user' | 'assistant' },
            status: 'success' as const,
          }))
        );
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [conversationId, setMessages]);

  const handleSubmit = async (content: string) => {
    if (!content.trim()) return;

    if (!conversationId) {
      // Create new conversation first
      if (!selectedModel) {
        const firstChatModel = models[0];
        if (!firstChatModel) return;
        setSelectedModel(firstChatModel.id);
      }
      try {
        const conv = await api.post<{ id: number }>('/conversations', {
          title: content.slice(0, 50),
          model_id: selectedModel || models[0]?.id,
        });
        onConversationCreated?.(conv.id);
        // Message will be sent after provider re-creation via useEffect
        return;
      } catch (err) {
        console.error(err);
        return;
      }
    }

    onRequest({ content, modelId: selectedModel ?? undefined });
  };

  const handlePromptClick: PromptsProps['onItemClick'] = (info) => {
    handleSubmit(info.data.label as string);
  };

  const showWelcome = !conversationId && messages.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Model selector */}
      <div style={{
        padding: '8px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <ThunderboltOutlined style={{ color: token.colorPrimary }} />
        <Select
          size="small"
          placeholder="选择模型"
          value={selectedModel}
          onChange={setSelectedModel}
          style={{ minWidth: 200 }}
          options={models.map((m) => ({
            value: m.id,
            label: `${m.provider?.name ?? ''} / ${m.display_name}`,
          }))}
        />
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Spin />
          </div>
        ) : showWelcome ? (
          <div style={{ maxWidth: 600, margin: '60px auto' }}>
            <Welcome
              icon={
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                }}>
                  ⚡
                </div>
              }
              title="ModelHub AI 助手"
              description="我可以帮助你完成对话、创作、编程等各种任务，选择一个模型开始聊天吧！"
            />
            <div style={{ marginTop: 24 }}>
              <Prompts
                title="试试这些话题"
                items={PROMPTS}
                onItemClick={handlePromptClick}
                wrap
              />
            </div>
          </div>
        ) : (
          <Bubble.List
            role={{
              user: {
                placement: 'end',
                avatar: (
                  <Avatar icon={<UserOutlined />} style={{ background: '#7c3aed' }} />
                ),
              },
              assistant: {
                placement: 'start',
                avatar: (
                  <Avatar icon={<RobotOutlined />} style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }} />
                ),
              },
            }}
            items={messages.map(({ id, message, status }) => ({
              key: id,
              role: message.role,
              content: message.content,
              loading: status === 'loading',
            }))}
          />
        )}
      </div>

      {/* Sender */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Sender
          loading={isRequesting}
          onSubmit={handleSubmit}
          onCancel={abort}
          placeholder="输入消息，Shift+Enter 换行，Enter 发送"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12,
          }}
        />
        {!selectedModel && models.length > 0 && (
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4, display: 'block' }}>
            提示：请先选择一个模型
          </Text>
        )}
      </div>
    </div>
  );
}

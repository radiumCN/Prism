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
import type { ModelInfo, Message } from '@/types';

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
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Holds a message typed/clicked before a conversation existed; sent once provider is ready.
  const pendingMessageRef = useRef<string | null>(null);
  // ID of the conversation we just created — skip history loading for it (it's empty anyway)
  // so Effect 2 doesn't wipe messages that Effect 1 is about to insert.
  const justCreatedConvRef = useRef<number | null>(null);
  // Stable refs so effects don't need these in their dep arrays
  const onRequestRef = useRef<typeof onRequest | null>(null);
  const selectedModelRef = useRef(selectedModel);
  selectedModelRef.current = selectedModel;

  // Re-create provider whenever conversationId or token changes.
  // Guard: return null if either is missing so we never send "Bearer ".
  const provider = useMemo(() => {
    if (!conversationId || !accessToken) return null;
    return createChatProvider(conversationId, accessToken, selectedModel?.model_id);
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

  // Keep onRequest ref up-to-date without adding it to effect deps
  onRequestRef.current = onRequest;

  useEffect(() => {
    api.get<ModelInfo[]>('/models?type=chat').then((list) => {
      const safe = list ?? [];
      setModels(safe);
      if (safe.length > 0 && !selectedModelRef.current) setSelectedModel(safe[0]);
    }).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When conversationId + provider become ready, flush any pending message
  useEffect(() => {
    if (conversationId && provider && pendingMessageRef.current) {
      const content = pendingMessageRef.current;
      pendingMessageRef.current = null;
      onRequestRef.current?.({ content, modelId: selectedModelRef.current?.model_id });
    }
  }, [conversationId, provider]);

  // Load history when conversation changes.
  // Skip for newly-created conversations: they have no history and loading would
  // call setMessages([]) which wipes the pending message that Effect 1 just sent.
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    if (justCreatedConvRef.current === conversationId) {
      justCreatedConvRef.current = null;
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
      const model = selectedModel ?? models[0];
      if (!model) return;
      // Save message so it gets sent once the conversation + provider are ready
      pendingMessageRef.current = content;
      try {
        const conv = await api.post<{ id: number }>('/conversations', {
          title: content.slice(0, 50),
          model_id: model.model_id,
          provider_id: model.provider_id,
        });
        // Mark BEFORE notifying parent so the history-load effect can skip it
        justCreatedConvRef.current = conv.id;
        onConversationCreated?.(conv.id);
      } catch (err) {
        pendingMessageRef.current = null;
        console.error(err);
      }
      return;
    }

    onRequest({ content, modelId: selectedModel?.model_id });
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
          value={selectedModel ? `${selectedModel.provider_id}:${selectedModel.model_id}` : undefined}
          onChange={(val) => {
            const [pid, mid] = (val as string).split(':').map(Number);
            const found = models.find((m) => m.provider_id === pid && m.model_id === mid);
            if (found) setSelectedModel(found);
          }}
          style={{ minWidth: 220 }}
          options={models.map((m) => ({
            value: `${m.provider_id}:${m.model_id}`,
            label: `${m.provider_name} / ${m.display_name}`,
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

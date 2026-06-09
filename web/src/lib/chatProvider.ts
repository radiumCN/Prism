import { AbstractChatProvider, XRequest } from '@ant-design/x-sdk';
import type { TransformMessage, XRequestOptions } from '@ant-design/x-sdk';

export interface ChatMessage {
  content: string;
  role: 'user' | 'assistant';
}

interface ChatInput {
  content: string;
  conversationId: number;
  modelId?: number;
  stream?: boolean;
}

interface ChatOutput {
  content: string;
}

export class ModelHubChatProvider extends AbstractChatProvider<ChatMessage, ChatInput, ChatOutput> {
  transformParams(
    requestParams: Partial<ChatInput>,
    options: XRequestOptions<ChatInput, ChatOutput, ChatMessage>,
  ): ChatInput {
    return {
      ...(options?.params || {}),
      content: requestParams.content || '',
      conversationId: requestParams.conversationId || 0,
      modelId: requestParams.modelId,
      stream: true,
    };
  }

  transformLocalMessage(requestParams: Partial<ChatInput>): ChatMessage {
    return {
      content: requestParams.content || '',
      role: 'user',
    };
  }

  transformMessage(info: TransformMessage<ChatMessage, ChatOutput>): ChatMessage {
    const { originMessage, chunk } = info;

    if (!chunk?.content || chunk.content === '[DONE]') {
      return { ...(originMessage || { content: '', role: 'assistant' }) };
    }

    return {
      content: `${originMessage?.content || ''}${chunk.content}`,
      role: 'assistant',
    };
  }
}

export function createChatProvider(conversationId: number, accessToken: string, modelId?: number) {
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api');
  const url = `${baseUrl}/conversations/${conversationId}/messages`;
  // Fall back to localStorage in case the Zustand store hasn't rehydrated yet
  const token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '');

  return new ModelHubChatProvider({
    request: XRequest<ChatInput, ChatOutput>(url, {
      manual: true,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      params: {
        conversationId,
        modelId,
        stream: true,
      },
    }),
  });
}

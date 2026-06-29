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

// XRequest's default SSE separator parsing produces this shape for Gin SSEvent output.
// Gin sends:  event: message\ndata: {"content":"..."}\n\n
// XRequest produces: { event: "message", data: '{"content":"..."}' }
interface ChatOutput {
  content?: string;
  event?: string;
  data?: string;
}

function getAccessToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('access_token') || '';
}

export class PrismChatProvider extends AbstractChatProvider<ChatMessage, ChatInput, ChatOutput> {
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

    // XRequest default SSE parsing gives: { event: "message", data: '{"content":"..."}' }
    // for Gin's SSEvent format. Extract the actual text content from the data field.
    let text = chunk?.content;
    if (!text && chunk?.event === 'message' && chunk?.data) {
      try {
        const parsed = JSON.parse(chunk.data) as { content?: string };
        text = parsed.content;
      } catch { /* ignore malformed */ }
    }
    // Also handle error events so the user sees the error message instead of a frozen spinner.
    if (!text && chunk?.event === 'error' && chunk?.data) {
      try {
        const parsed = JSON.parse(chunk.data) as { error?: string };
        if (parsed.error) text = `[错误] ${parsed.error}`;
      } catch { /* ignore */ }
    }

    if (!text || text === '[DONE]') {
      return { ...(originMessage || { content: '', role: 'assistant' }) };
    }

    return {
      content: `${originMessage?.content || ''}${text}`,
      role: 'assistant',
    };
  }
}

export function createChatProvider(conversationId: number, modelId?: number) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  const url = `${baseUrl}/conversations/${conversationId}/messages`;

  return new PrismChatProvider({
    request: XRequest<ChatInput, ChatOutput>(url, {
      manual: true,
      middlewares: {
        onRequest: async (...args) => {
          const [fetchUrl, init] = args;
          const tok = getAccessToken();
          return [
            fetchUrl,
            {
              ...(init || {}),
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${tok}`,
              },
            },
          ];
        },
      },
      params: {
        conversationId,
        modelId,
        stream: true,
      },
    }),
  });
}

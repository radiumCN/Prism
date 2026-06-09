export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface AIModel {
  id: number;
  provider_id: number;
  model_name: string;
  display_name: string;
  type: 'chat' | 'image' | 'video';
  max_tokens: number;
  supports_streaming: boolean;
  supports_vision: boolean;
  status: string;
  provider?: Provider;
}

export interface Provider {
  id: number;
  name: string;
  base_url: string;
  status: string;
}

export interface Conversation {
  id: number;
  title: string;
  model_id: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

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

export interface PublicSiteConfig {
  site_name: string;
  registration_open: boolean;
}

/** Pure model definition, independent of any provider. */
export interface AIModel {
  id: number;
  model_name: string;
  display_name: string;
  type: 'chat' | 'image' | 'video';
  /** API endpoint format: openai_chat | openai_responses | anthropic_messages | gemini_generate */
  api_format: string;
  max_tokens: number;
  supports_streaming: boolean;
  supports_vision: boolean;
  config_json?: string;
  status: string;
}

/** A (provider, model) combination returned by /api/models for chat use. */
export interface ModelInfo {
  provider_id: number;
  provider_name: string;
  model_id: number;
  model_name: string;
  display_name: string;
  type: 'chat' | 'image' | 'video';
  max_tokens: number;
  supports_streaming: boolean;
  supports_vision: boolean;
}

/** Join table row returned by GET /providers/:id/models */
export interface ProviderModel {
  provider_id: number;
  model_id: number;
  status: string;
  model?: AIModel;
}

export interface Provider {
  id: number;
  name: string;
  base_url: string;
  status: string;
}

export interface Skill {
  id: number;
  name: string;
  description: string;
  system_prompt: string;
  icon: string;
  status: string;
}

export interface MCPServer {
  id: number;
  name: string;
  description: string;
  url?: string;
  has_auth?: boolean;
  status: string;
}

export interface Conversation {
  id: number;
  title: string;
  model_id: number;
  provider_id: number;
  pinned: boolean;
  skill_ids?: string;      // JSON array
  mcp_server_ids?: string; // JSON array
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

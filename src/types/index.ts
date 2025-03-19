export interface LLMConfig {
  name: string;
  icon: string;
  color: string;
  apiEndpoint: string;
  apiKeyName: string;
  models: { value: string; label: string }[];
  selectedModel: string;
}

export interface LLMResponse {
  model: string;
  response: string;
  loading: boolean;
  error?: string;
}

export interface APIError extends Error {
  status?: number;
  retryAfter?: number;
} 
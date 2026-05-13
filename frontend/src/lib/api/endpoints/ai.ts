import { api } from '../client';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const aiApi = {
  chat: (messages: ChatMessage[], options?: { model?: string }) =>
    api.post<{ message: ChatMessage; model: string }>('/ai/chat', { messages, options }),

  complete: (prompt: string, options?: { model?: string }) =>
    api.post<{ text: string; model: string }>('/ai/complete', { prompt, options }),

  reviewCode: (code: string, language: string) =>
    api.post<{ review: string; suggestions: string[]; model: string }>('/ai/review', { code, language }),

  getStatus: () =>
    api.get<{ enabled: boolean; provider: string; model: string }>('/ai/status'),
};

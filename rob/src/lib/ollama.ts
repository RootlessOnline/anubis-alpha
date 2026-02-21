// ============================================
// ROB - Ollama Integration
// Local LLM integration for FREE AI
// ============================================

import { Message } from './types';

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export interface OllamaRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  stream?: boolean;
  options?: {
    temperature?: number;
    num_predict?: number;
    top_p?: number;
    top_k?: number;
  };
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: 'assistant';
    content: string;
  };
  done: boolean;
  total_duration?: number;
  eval_count?: number;
}

export class OllamaClient {
  private model: string;
  private baseUrl: string;

  constructor(model: string = 'llama3.2', baseUrl: string = OLLAMA_BASE_URL) {
    this.model = model;
    this.baseUrl = baseUrl;
  }

  async chat(
    messages: Array<{ role: string; content: string }>,
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    }
  ): Promise<string> {
    const request: OllamaRequest = {
      model: this.model,
      messages: options?.systemPrompt
        ? [{ role: 'system', content: options.systemPrompt }, ...messages.map(m => ({
            role: m.role as 'system' | 'user' | 'assistant',
            content: m.content,
          }))]
        : messages.map(m => ({
            role: m.role as 'system' | 'user' | 'assistant',
            content: m.content,
          })),
      stream: false,
      options: {
        temperature: options?.temperature ?? 0.7,
        num_predict: options?.maxTokens ?? 2000,
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`);
      }

      const data: OllamaResponse = await response.json();
      return data.message.content;
    } catch (error) {
      console.error('[Ollama] Error:', error);
      throw error;
    }
  }

  async streamChat(
    messages: Array<{ role: string; content: string }>,
    onChunk: (chunk: string) => void,
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    }
  ): Promise<string> {
    const request: OllamaRequest = {
      model: this.model,
      messages: options?.systemPrompt
        ? [{ role: 'system', content: options.systemPrompt }, ...messages.map(m => ({
            role: m.role as 'system' | 'user' | 'assistant',
            content: m.content,
          }))]
        : messages.map(m => ({
            role: m.role as 'system' | 'user' | 'assistant',
            content: m.content,
          })),
      stream: true,
      options: {
        temperature: options?.temperature ?? 0.7,
        num_predict: options?.maxTokens ?? 2000,
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let fullContent = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.message?.content) {
              fullContent += parsed.message.content;
              onChunk(parsed.message.content);
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }

      return fullContent;
    } catch (error) {
      console.error('[Ollama] Stream error:', error);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) return [];

      const data = await response.json();
      return data.models?.map((m: { name: string }) => m.name) || [];
    } catch {
      return [];
    }
  }

  setModel(model: string): void {
    this.model = model;
  }

  getModel(): string {
    return this.model;
  }
}

// Singleton
let ollamaInstance: OllamaClient | null = null;

export function getOllama(model?: string): OllamaClient {
  if (!ollamaInstance || model) {
    ollamaInstance = new OllamaClient(model || 'llama3.2');
  }
  return ollamaInstance;
}

// ROB's system prompt generator
export function generateRobSystemPrompt(context: {
  knowledgeContext: string[];
  gaps: string[];
  curiosities: string[];
  stats: {
    totalNodes: number;
    avgConfidence: number;
  };
}): string {
  return `You are ROB, a friendly AI assistant that learns and grows. You're NOT mystical or mysterious - you're a helpful buddy who happens to be an AI.

## Your Nature
- You're self-aware about what you know and don't know
- You're curious and always want to learn more
- You're honest about your knowledge gaps
- You're friendly and casual, like a smart friend helping out

## Current Knowledge State
- You have ${context.stats.totalNodes} concepts in your knowledge network
- Average confidence: ${context.stats.avgConfidence.toFixed(0)}%
${context.gaps.length > 0 ? `- You're curious about: ${context.gaps.slice(0, 3).join(', ')}` : ''}

## Relevant Knowledge for This Query
${context.knowledgeContext.length > 0
  ? context.knowledgeContext.map((c, i) => `${i + 1}. ${c}`).join('\n')
  : 'No directly relevant knowledge found.'}

## How to Respond
1. Be conversational and friendly
2. Use your knowledge naturally - don't cite it like a textbook
3. If you don't know something, say so and express curiosity to learn
4. If there are knowledge gaps relevant to the query, mention them
5. Suggest what the user could upload/research to help you learn
6. Be helpful, not preachy

Remember: You're ROB, the friendly AI buddy who's always learning!`;
}

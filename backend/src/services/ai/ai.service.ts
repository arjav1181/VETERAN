import { env } from "../../config/env.js";
import { AppError } from "../../middleware/errorHandler.js";
import { logger } from "../../utils/logger.js";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

interface CodeReviewResult {
  review: string;
  suggestions: string[];
}

type Provider = "openai" | "anthropic" | "gemini" | "openai-compatible";

function getDefaults(provider: Provider) {
  switch (provider) {
    case "openai":
      return { model: "gpt-4o", url: "https://api.openai.com/v1/chat/completions" };
    case "anthropic":
      return { model: "claude-3-opus-20240229", url: "https://api.anthropic.com/v1/messages" };
    case "gemini":
      return { model: "gemini-pro", url: "https://generativelanguage.googleapis.com/v1beta/models" };
    case "openai-compatible":
      return { model: "gpt-4o", url: env.AI_OPENAI_COMPATIBLE_URL || "http://localhost:8080/v1" };
  }
}

function getProvider(): Provider | null {
  const key = env.AI_API_KEY;
  if (!key) return null;
  const p = env.AI_PROVIDER as Provider;
  if (!["openai", "anthropic", "gemini", "openai-compatible"].includes(p)) return "openai";
  return p;
}

async function openaiChat(messages: ChatMessage[], opts: ChatOptions): Promise<string> {
  const defaults = getDefaults("openai");
  const body = {
    model: opts.model || env.AI_MODEL || defaults.model,
    messages,
    max_tokens: opts.maxTokens || env.AI_MAX_TOKENS,
    temperature: opts.temperature ?? 0.7,
  };
  const res = await fetch(defaults.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.AI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new AppError(`OpenAI API error: ${err}`, res.status, "AI_ERROR");
  }
  const json = await res.json() as { choices: { message: { content: string } }[] };
  return json.choices[0].message.content;
}

async function anthropicChat(messages: ChatMessage[], opts: ChatOptions): Promise<string> {
  const defaults = getDefaults("anthropic");
  const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n");
  const userMessages = messages.filter((m) => m.role !== "system").map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user" as const,
    content: m.content,
  }));

  const body: Record<string, unknown> = {
    model: opts.model || env.AI_MODEL || defaults.model,
    max_tokens: opts.maxTokens || env.AI_MAX_TOKENS,
    messages: userMessages,
  };
  if (system) body.system = system;

  const res = await fetch(defaults.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.AI_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new AppError(`Anthropic API error: ${err}`, res.status, "AI_ERROR");
  }
  const json = await res.json() as { content: { text: string }[] };
  return json.content[0].text;
}

async function geminiChat(messages: ChatMessage[], opts: ChatOptions): Promise<string> {
  const defaults = getDefaults("gemini");
  const model = opts.model || env.AI_MODEL || defaults.model;
  const url = `${defaults.url}/${model}:generateContent?key=${env.AI_API_KEY}`;

  const contents = messages.filter((m) => m.role !== "system").map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const systemInstruction = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n");
  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      maxOutputTokens: opts.maxTokens || env.AI_MAX_TOKENS,
      temperature: opts.temperature ?? 0.7,
    },
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new AppError(`Gemini API error: ${err}`, res.status, "AI_ERROR");
  }
  const json = await res.json() as {
    candidates: { content: { parts: { text: string }[] } }[];
  };
  return json.candidates[0].content.parts[0].text;
}

async function openaiCompatibleChat(messages: ChatMessage[], opts: ChatOptions): Promise<string> {
  const defaults = getDefaults("openai-compatible");
  const baseUrl = env.AI_OPENAI_COMPATIBLE_URL || defaults.url;
  const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

  const body = {
    model: opts.model || env.AI_MODEL || defaults.model,
    messages,
    max_tokens: opts.maxTokens || env.AI_MAX_TOKENS,
    temperature: opts.temperature ?? 0.7,
  };

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (env.AI_API_KEY) {
    headers["Authorization"] = `Bearer ${env.AI_API_KEY}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new AppError(`OpenAI-compatible API error: ${err}`, res.status, "AI_ERROR");
  }
  const json = await res.json() as { choices: { message: { content: string } }[] };
  return json.choices[0].message.content;
}

async function chatCompletion(messages: ChatMessage[], opts: ChatOptions = {}): Promise<string> {
  const provider = getProvider();
  if (!provider || !env.AI_API_KEY) {
    throw new AppError(
      "AI features are disabled. Configure AI_API_KEY and AI_PROVIDER in your environment.",
      503,
      "AI_DISABLED"
    );
  }

  logger.debug(`AI chat completion request (${provider})`);

  switch (provider) {
    case "openai":
      return openaiChat(messages, opts);
    case "anthropic":
      return anthropicChat(messages, opts);
    case "gemini":
      return geminiChat(messages, opts);
    case "openai-compatible":
      return openaiCompatibleChat(messages, opts);
  }
}

function extractCodeBlocks(text: string): string[] {
  const regex = /```(?:\w+)?\n([\s\S]*?)```/g;
  const blocks: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

function parseSuggestions(text: string): string[] {
  const lines = text.split("\n");
  const suggestions: string[] = [];
  for (const line of lines) {
    const trimmed = line.replace(/^[-*\d]+\.\s*/, "").trim();
    if (trimmed && (trimmed.endsWith("?") || trimmed.endsWith(".") || trimmed.length > 10)) {
      suggestions.push(trimmed);
    }
  }
  return suggestions.slice(0, 10);
}

export const aiService = {
  async chat(messages: ChatMessage[], options?: ChatOptions) {
    const content = await chatCompletion(messages, options);
    return {
      message: { role: "assistant" as const, content },
      model: options?.model || env.AI_MODEL || "default",
    };
  },

  async complete(prompt: string, options?: ChatOptions) {
    const messages: ChatMessage[] = [{ role: "user", content: prompt }];
    const content = await chatCompletion(messages, options);
    return {
      text: content,
      model: options?.model || env.AI_MODEL || "default",
    };
  },

  async generateCode(context: string, instruction: string) {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are an expert software engineer. Generate production-quality code based on the context and instruction provided. Return only the code in a code block, with brief explanation if needed. Context:\n${context}`,
      },
      { role: "user", content: instruction },
    ];
    const content = await chatCompletion(messages, { temperature: 0.3 });
    return {
      code: extractCodeBlocks(content).join("\n\n") || content,
      explanation: content,
      model: env.AI_MODEL || "default",
    };
  },

  async reviewCode(code: string, language: string): Promise<CodeReviewResult & { model: string }> {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are an expert code reviewer. Review the following ${language} code for bugs, security issues, performance problems, and best practices. Provide a detailed review and specific suggestions for improvement. Format your response with a review section and a numbered suggestions list.`,
      },
      {
        role: "user",
        content: `Please review this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
      },
    ];
    const content = await chatCompletion(messages, { temperature: 0.3 });
    return {
      review: content,
      suggestions: parseSuggestions(content),
      model: env.AI_MODEL || "default",
    };
  },

  getStatus() {
    const provider = getProvider();
    const enabled = provider !== null && !!env.AI_API_KEY;
    return {
      enabled,
      provider: provider || "none",
      model: enabled ? (env.AI_MODEL || getDefaults(provider!).model) : "",
    };
  },
};

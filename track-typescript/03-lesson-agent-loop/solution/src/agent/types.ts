/**
 * Core agent type definitions for the Claude Code agent.
 */

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ToolCall {
  name: string;
  input: Record<string, any>;
  id: string;
}

export interface ToolResult {
  toolCallId: string;
  output: string;
  error?: string;
}

export interface AgentConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  maxIterations: number;
  systemPrompt: string;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  iterations: number;
  toolCalls: number;
}

export interface AgentOptions {
  initialMessage?: string;
  model?: string;
  maxIterations?: number;
}

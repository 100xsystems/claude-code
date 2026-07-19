/**
 * Agent Loop — The core reasoning cycle:
 *   Think → Act → Observe
 *
 * The agent processes tasks by iterating through this loop:
 * 1. THINK: Send conversation to LLM and get response
 * 2. ACT: If the LLM requests tool calls, execute them via ToolRegistry
 * 3. OBSERVE: Feed tool results back as context for the next iteration
 *
 * The loop terminates when:
 * - The LLM provides a final response (no more tool calls)
 * - Maximum iterations are reached
 */

import { ToolRegistry } from '../tools/registry.js';
import type { Message, ToolCall, AgentConfig, ExecutionResult, AgentOptions } from './types.js';

const DEFAULT_CONFIG: AgentConfig = {
  model: 'claude-3-opus-20240229',
  maxTokens: 4096,
  temperature: 0.7,
  maxIterations: 25,
  systemPrompt: 'You are Claude Code, an AI-powered coding agent.',
};

export class Agent {
  private config: AgentConfig;
  private messages: Message[];
  private toolRegistry: ToolRegistry;

  constructor(config?: Partial<AgentConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.messages = [];
    this.toolRegistry = new ToolRegistry();
  }

  /**
   * Start an interactive session or single task.
   */
  async start(options: AgentOptions = {}): Promise<void> {
    const message = options.initialMessage || '';
    if (message) {
      const result = await this.executeTask(message);
      console.log(result.output);
    }
  }

  /**
   * Execute a single task through the agent loop.
   * Returns the final output and execution metadata.
   */
  async executeTask(task: string): Promise<ExecutionResult> {
    this.messages.push({ role: 'user', content: task });

    let iterations = 0;
    let toolCalls = 0;

    while (iterations < this.config.maxIterations) {
      iterations++;

      // THINK: Get response from LLM
      const response = await this.think();

      // Check if the response contains tool calls
      const calls = this.parseToolCalls(response);

      if (calls.length === 0) {
        // No more tool calls — this is the final response
        this.messages.push({ role: 'assistant', content: response });
        return {
          success: true,
          output: response,
          iterations,
          toolCalls,
        };
      }

      // ACT: Execute each tool call
      for (const call of calls) {
        toolCalls++;
        const result = await this.toolRegistry.execute(call.name, call.input);

        // OBSERVE: Feed result back as context
        this.messages.push({
          role: 'assistant',
          content: JSON.stringify({ tool: call.name, result }),
        });
      }
    }

    return {
      success: false,
      output: 'Max iterations reached without completion.',
      iterations,
      toolCalls,
    };
  }

  /**
   * THINK: Send conversation context to LLM and get response.
   * In a real implementation, this calls the Anthropic API.
   * For now, returns a simulated response.
   */
  private async think(): Promise<string> {
    // Simulate LLM thinking delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Check if the last user message is asking for a tool operation
    const lastMessage = this.messages[this.messages.length - 1];
    if (lastMessage && this.shouldUseTool(lastMessage.content)) {
      return JSON.stringify({
        tool_use: 'execute_command',
        input: { command: lastMessage.content },
      });
    }

    return `Understood. Processing task: ${lastMessage?.content || 'no input'}`;
  }

  /**
   * Parse tool calls from LLM response.
   * Checks if the response contains a tool_use block.
   */
  private parseToolCalls(response: string): ToolCall[] {
    try {
      const parsed = JSON.parse(response);
      if (parsed.tool_use) {
        return [
          {
            name: parsed.tool_use,
            input: parsed.input || {},
            id: `call_${Date.now()}`,
          },
        ];
      }
    } catch {
      // Not JSON — it's a plain text response (no tool calls)
    }
    return [];
  }

  /**
   * Simple heuristic to determine if a tool should be used.
   */
  private shouldUseTool(content: string): boolean {
    const toolTriggers = ['run', 'execute', 'create', 'write', 'read', 'search', 'list'];
    return toolTriggers.some((trigger) => content.toLowerCase().includes(trigger));
  }
}

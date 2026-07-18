---
title: "The Agent Loop: Think → Act → Observe"
order: 3
module: "CLI Foundations"
track: "typescript"
difficulty: "Intermediate"
estimated_time: "60 min"
learning_objectives:
  - "Implement the core agent loop (think → act → observe)"
  - "Design a tool execution system with typed interfaces"
  - "Handle tool calls, responses, and error recovery"
prerequisites:
  - "claude-code/typescript/lesson-2"
knowledge_refs:
  - "patterns/observer"
  - "patterns/strategy"
  - "principles/single-responsibility"
validation:
  - type: test-runner
    test_file: "tests/behavior.test.ts"
    framework: vitest
    timeout: 120000
    expected_passes: 6
---

# The Agent Loop: Think → Act → Observe

The agent loop is the beating heart of any AI coding agent. It's a continuous cycle that processes user input, determines what actions to take, executes them, and feeds the results back into the model.

## The Loop Architecture

```
User Input
    │
    ▼
┌─────────────────────────────────────────┐
│            THINK                          │
│  LLM processes context, decides action    │
│  Returns: tool_use or text response       │
└────────────┬────────────────────────────┘
             │
      ┌──────┴──────┐
      │ tool_use?   │
      └──────┬──────┘
             │
    ┌────────▼────────┐        ┌──────────────────┐
    │      ACT         │        │   TEXT RESPONSE   │
    │ Execute tool     │        │ Return to user    │
    │ via registry     │        └──────────────────┘
    └────────┬────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│           OBSERVE                        │
│  Tool result → formatted context         │
│  Feed back to LLM for next iteration     │
└────────────┬────────────────────────────┘
             │
             ▼
      (repeat until done)
```

## Step 1: Define Agent Types

Create `src/agent/types.ts`:

```typescript
export type AgentRole = 'user' | 'assistant' | 'tool';

export interface Message {
  role: AgentRole;
  content: string;
  toolCallId?: string;
  name?: string;
}

export interface ToolCall {
  id: string;
  type: 'tool_use';
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  content: string;
  isError?: boolean;
}

export interface AgentConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  maxToolIterations: number;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  messages: Message[];
  toolCalls: number;
  totalTokens: number;
}
```

## Step 2: Implement the Agent Loop

Create `src/agent/loop.ts`:

```typescript
import { LLMClient } from '../llm/client.js';
import { ToolRegistry } from '../tools/registry.js';
import { StreamProcessor } from '../llm/streaming.js';
import {
  Message, ToolCall, ToolResult,
  AgentConfig, ExecutionResult,
} from './types.js';

export class Agent {
  private messages: Message[] = [];
  private config: AgentConfig;
  private tools: ToolRegistry;
  private llm: LLMClient;

  constructor(config?: Partial<AgentConfig>) {
    this.config = {
      model: process.env.LLM_MODEL || 'claude-sonnet-4-20250514',
      maxTokens: 4096,
      temperature: 0.7,
      systemPrompt: this.getDefaultSystemPrompt(),
      maxToolIterations: 25,
      ...config,
    };
    this.tools = new ToolRegistry();
    this.llm = new LLMClient(this.config);
  }

  async startInteractive(options: {
    initialMessage?: string;
    stream?: boolean;
  }): Promise<void> {
    console.log('\n🤖 Claude Code ready. Type your task (Ctrl+C to exit)\n');

    if (options.initialMessage) {
      this.messages.push({ role: 'user', content: options.initialMessage });
      await this.runLoop(options.stream !== false);
    }
  }

  async executeTask(task: string): Promise<ExecutionResult> {
    this.messages = [{ role: 'user', content: task }];
    await this.runLoop(false);
    return {
      success: true,
      output: this.messages[this.messages.length - 1]?.content || '',
      messages: this.messages,
      toolCalls: 0,
      totalTokens: 0,
    };
  }

  private async runLoop(stream: boolean): Promise<void> {
    let iterations = 0;

    while (iterations < this.config.maxToolIterations) {
      iterations++;

      // ── THINK ─────────────────────────────────────────────
      const response = stream
        ? await this.llm.sendStreaming(this.messages, this.tools.getToolSchemas())
        : await this.llm.send(this.messages, this.tools.getToolSchemas());

      this.messages.push({
        role: 'assistant',
        content: response.content,
      });

      // Check if there are tool calls
      if (!response.toolCalls || response.toolCalls.length === 0) {
        // No tools needed → done thinking
        break;
      }

      // ── ACT ────────────────────────────────────────────────
      for (const toolCall of response.toolCalls) {
        const result = await this.executeToolCall(toolCall);

        // ── OBSERVE ──────────────────────────────────────────
        this.messages.push({
          role: 'tool',
          content: result.content,
          toolCallId: result.toolCallId,
          name: toolCall.name,
        });
      }
    }
  }

  private async executeToolCall(toolCall: ToolCall): Promise<ToolResult> {
    try {
      const result = await this.tools.execute(
        toolCall.name,
        toolCall.input,
      );
      return {
        toolCallId: toolCall.id,
        content: typeof result === 'string' ? result : JSON.stringify(result),
      };
    } catch (error: any) {
      return {
        toolCallId: toolCall.id,
        content: `Error: ${error.message}`,
        isError: true,
      };
    }
  }

  private getDefaultSystemPrompt(): string {
    return `You are Claude Code, an AI coding agent.
You have access to tools that let you read, write, and execute code.
Always think step by step. Use the appropriate tools for each task.
When you're done, summarize what you did.`;
  }
}
```

## Step 3: Create the Tool Registry

Create `src/tools/registry.ts`:

```typescript
export interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<unknown>;
}

export class ToolRegistry {
  private tools = new Map<string, Tool>();

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  async execute(name: string, input: Record<string, unknown>): Promise<unknown> {
    const tool = this.get(name);
    if (!tool) throw new Error(`Unknown tool: ${name}`);
    return tool.execute(input);
  }

  getToolSchemas() {
    return Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema,
    }));
  }
}
```

## Key Design Pattern: Strategy Pattern

The agent loop uses the **Strategy pattern** — each tool is a strategy that can be registered, unregistered, or replaced independently. The loop itself doesn't know what any tool does internally. It just:

1. Gets tool schemas → sends to LLM
2. LLM decides which tool to use
3. Loop executes the tool by name
4. Result goes back as context

This makes the system **infinitely extensible**.

## Validation Checklist

- [ ] `src/agent/types.ts` defines all required types
- [ ] `src/agent/loop.ts` implements the think-act-observe cycle
- [ ] `src/tools/registry.ts` implements the tool registry
- [ ] The loop handles tool calls, text responses, and errors
- [ ] Max iterations limit prevents infinite loops
- [ ] `npm run build` passes without errors

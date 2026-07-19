/**
 * ToolRegistry — Strategy pattern implementation.
 *
 * Tools are registered by name and executed dynamically.
 * The agent loop only needs to know about this registry;
 * individual tool implementations are decoupled.
 */

import type { ToolCall } from '../agent/types.js';

export interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  execute(input: Record<string, any>): Promise<string>;
}

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  /**
   * Register a tool by name.
   */
  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Get all registered tool schemas for LLM function calling.
   */
  getSchemas(): Record<string, any>[] {
    const schemas: Record<string, any>[] = [];
    for (const [, tool] of this.tools) {
      schemas.push({
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema,
      });
    }
    return schemas;
  }

  /**
   * Execute a tool by name with given input.
   */
  async execute(name: string, input: Record<string, any>): Promise<string> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    return tool.execute(input);
  }

  /**
   * Check if a tool is registered.
   */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get all registered tool names.
   */
  list(): string[] {
    return Array.from(this.tools.keys());
  }
}

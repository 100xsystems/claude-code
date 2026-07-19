/**
 * ToolRegistry — Strategy pattern for tool registration and execution.
 * Enhanced with filesystem, execute, and search tools pre-registered.
 */

import { readFile, writeFile, listFiles } from './filesystem.js';
import { executeCommand } from './execute.js';
import { searchCode } from './search.js';

export interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  execute(input: Record<string, any>): Promise<string>;
}

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  constructor() {
    this.registerDefaultTools();
  }

  private registerDefaultTools(): void {
    this.register({
      name: 'read_file',
      description: 'Read the contents of a file',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Path to the file' },
        },
        required: ['path'],
      },
      execute: (input) => readFile(input as any),
    });

    this.register({
      name: 'write_file',
      description: 'Write content to a file',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Path to the file' },
          content: { type: 'string', description: 'Content to write' },
        },
        required: ['path', 'content'],
      },
      execute: (input) => writeFile(input as any),
    });

    this.register({
      name: 'list_files',
      description: 'List files and directories in a path',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Directory path to list' },
        },
        required: ['path'],
      },
      execute: (input) => listFiles(input as any),
    });

    this.register({
      name: 'execute_command',
      description: 'Execute a shell command',
      inputSchema: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Command to execute' },
          timeout: { type: 'number', description: 'Timeout in ms' },
        },
        required: ['command'],
      },
      execute: (input) => executeCommand(input as any),
    });

    this.register({
      name: 'search_code',
      description: 'Search for a pattern across project files',
      inputSchema: {
        type: 'object',
        properties: {
          pattern: { type: 'string', description: 'Text pattern to search for' },
          path: { type: 'string', description: 'Optional directory to search in' },
        },
        required: ['pattern'],
      },
      execute: (input) => searchCode(input as any),
    });
  }

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

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

  async execute(name: string, input: Record<string, any>): Promise<string> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    return tool.execute(input);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  list(): string[] {
    return Array.from(this.tools.keys());
  }
}

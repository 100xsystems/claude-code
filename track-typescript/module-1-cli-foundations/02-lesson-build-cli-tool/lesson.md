---
title: "Build the CLI Tool"
order: 2
module: "CLI Foundations"
track: "typescript"
difficulty: "Beginner"
estimated_time: "45 min"
learning_objectives:
  - "Implement a full CLI with subcommands using Commander"
  - "Handle interactive and non-interactive modes"
  - "Process stdin/stdout for tool communication"
prerequisites:
  - "claude-code/typescript/lesson-1"
knowledge_refs:
  - "patterns/adapter"
  - "principles/single-responsibility"
validation:
  - type: test-runner
    test_file: "tests/behavior.test.ts"
    framework: vitest
    timeout: 120000
    expected_passes: 6
---

# Build the CLI Tool

In this lesson, we'll build the complete CLI interface for our AI coding agent. The CLI is the primary way users interact with the agent — it handles command parsing, interactive mode, and argument processing.

## CLI Architecture

```
User Input (terminal)
       │
       ▼
┌──────────────────┐
│   Commander CLI   │  ← Parses commands, options, args
│   (src/cli.ts)    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Agent Loop      │  ← Orchestrates AI interaction
│   (src/agent/)    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Tool System     │  ← Executes actions
│   (src/tools/)    │
└──────────────────┘
```

## Step 1: Implement the Full CLI

Update `src/cli.ts` with all the commands our agent needs:

```typescript
import { Command } from 'commander';
import { readFileSync, existsSync } from 'fs';
import { Agent } from './agent/loop.js';

export interface CLIOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  verbose?: boolean;
}

export function createCLI() {
  const program = new Command();

  program
    .name('claude-code')
    .description('AI-powered coding agent — build, debug, and refactor code with AI assistance')
    .version('0.1.0')
    .option('-m, --model <model>', 'LLM model to use', 'claude-sonnet-4-20250514')
    .option('-t, --max-tokens <number>', 'Maximum tokens in response', parseNumber, 4096)
    .option('--temperature <number>', 'Response creativity (0-1)', parseFloat, 0.7)
    .option('-v, --verbose', 'Enable verbose logging', false);

  // Interactive chat mode (default)
  program
    .command('chat', { isDefault: true })
    .description('Start an interactive AI coding session')
    .argument('[message]', 'Optional initial message')
    .option('--no-stream', 'Disable streaming responses')
    .action(async (message: string | undefined, options: any) => {
      const agent = new Agent();
      await agent.startInteractive({
        initialMessage: message,
        stream: options.stream !== false,
      });
    });

  // Single task execution
  program
    .command('execute')
    .description('Execute a single task in non-interactive mode')
    .argument('<task>', 'The task to execute')
    .option('-f, --file <path>', 'Read task from file')
    .action(async (task: string, options: any) => {
      const finalTask = options.file
        ? readFileSync(options.file, 'utf-8')
        : task;
      const agent = new Agent();
      const result = await agent.executeTask(finalTask);
      console.log(result.output);
      process.exit(result.success ? 0 : 1);
    });

  // Pipe mode — read from stdin
  program
    .command('pipe')
    .description('Process piped input (stdin)')
    .argument('[prompt]', 'Optional instruction prefix')
    .action(async (prompt: string | undefined) => {
      const stdin = await readStdin();
      const agent = new Agent();
      const task = prompt
        ? `${prompt}\n\n${stdin}`
        : stdin;
      const result = await agent.executeTask(task);
      console.log(result.output);
      process.exit(result.success ? 0 : 1);
    });

  return program;
}

function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    process.stdin.on('data', (chunk: Buffer) => chunks.push(chunk));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    if (process.stdin.isTTY) resolve('');
  });
}

function parseNumber(value: string): number {
  const n = parseInt(value, 10);
  if (isNaN(n)) throw new Error(`Invalid number: ${value}`);
  return n;
}
```

## Step 2: Handle Streaming vs Non-Streaming Modes

Create `src/llm/streaming.ts` for handling streaming responses:

```typescript
export interface StreamHandler {
  onToken: (token: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: Error) => void;
}

export class StreamProcessor {
  private buffer = '';

  constructor(private handler: StreamHandler) {}

  processChunk(chunk: string): void {
    this.buffer += chunk;

    // Process complete tokens
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.delta?.text || parsed.content || '';
          if (content) {
            this.handler.onToken(content);
          }
        } catch {
          // Skip malformed SSE data
        }
      }
    }
  }

  finish(): void {
    if (this.buffer.trim()) {
      this.handler.onToken(this.buffer);
    }
  }
}
```

## Step 3: Handle Errors Gracefully

Add error handling to the CLI:

```typescript
// Add after program.parse()
process.on('uncaughtException', (error) => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('\n⚠️ Unhandled rejection:', reason);
});
```

## Step 4: Test the CLI

```bash
# Build
npm run build

# Check help
node dist/index.js --help

# Test chat mode
node dist/index.js chat "Hello, what can you do?"

# Test execute mode
node dist/index.js execute "Create a hello world TypeScript file"

# Test pipe mode
echo "Explain this code" | node dist/index.js pipe
```

## Engineering Decision: Streaming vs Buffered

**Context:** The API supports both streaming (SSE events) and buffered (single response) modes.

**Decision:** We implement **both** — streaming by default with a `--no-stream` flag to disable it.

**Why:** Streaming provides a better UX with real-time token feedback, but buffered mode is useful for testing and CI environments where streaming doesn't add value.

## Validation Checklist

- [ ] `src/cli.ts` has `chat`, `execute`, and `pipe` commands
- [ ] Streaming handler works for SSE responses
- [ ] Error handling catches uncaught exceptions
- [ ] Help output shows all commands and options
- [ ] `npm run build` completes without errors

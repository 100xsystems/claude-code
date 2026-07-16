/**
 * Lesson 2: Build the CLI Tool
 *
 * Behavioral tests that verify:
 * - CLI has all required commands (chat, execute, pipe)
 * - --help output shows commands and options
 * - Streaming handler (src/llm/streaming.ts) processes SSE events
 * - Error handling catches uncaught exceptions
 * - Build still passes (cumulative: lesson 1)
 */
import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT = process.cwd();

describe('Lesson 2: Build the CLI Tool', () => {

  // ── Cumulative: Project structure still works (lesson 1) ─────────

  it('builds successfully (cumulative: lesson 1)', () => {
    const result = execSync('npm run build', {
      cwd: PROJECT,
      encoding: 'utf-8',
      timeout: 60000,
    });
    expect(result).toBeDefined();
    expect(fs.existsSync(path.join(PROJECT, 'dist'))).toBe(true);
  });

  // ── CLI Structure ────────────────────────────────────────────────

  it('has src/cli.ts with chat, execute, and pipe commands (lesson 2)', () => {
    const cliPath = path.join(PROJECT, 'src/cli.ts');
    expect(fs.existsSync(cliPath)).toBe(true);
    const content = fs.readFileSync(cliPath, 'utf-8');
    expect(content).toMatch(/chat/i);
    expect(content).toMatch(/execute/i);
    expect(content).toMatch(/pipe/i);
  });

  it('defines global CLI options like --model, --max-tokens, --temperature (lesson 2)', () => {
    const cliPath = path.join(PROJECT, 'src/cli.ts');
    const content = fs.readFileSync(cliPath, 'utf-8');
    expect(content).toMatch(/model/i);
    expect(content).toMatch(/tokens/i);
    expect(content).toMatch(/temperature/i);
  });

  it('has src/llm/streaming.ts with SSE processing (lesson 2)', () => {
    const streamingPath = path.join(PROJECT, 'src/llm/streaming.ts');
    expect(fs.existsSync(streamingPath)).toBe(true);
    const content = fs.readFileSync(streamingPath, 'utf-8');
    expect(content).toMatch(/onToken|processChunk|delta|data:/i);
  });

  // ── Streaming Logic ──────────────────────────────────────────────

  it('StreamProcessor processes SSE chunks correctly (lesson 2)', async () => {
    const { StreamProcessor } = await import(path.join(PROJECT, 'dist/llm/streaming.js'));

    const tokens: string[] = [];
    const processor = new StreamProcessor({
      onToken: (token: string) => tokens.push(token),
      onComplete: () => {},
      onError: () => {},
    });

    processor.processChunk('data: {"delta":{"text":"Hello"}}\n');
    processor.processChunk('data: {"delta":{"text":" world"}}\n');
    processor.processChunk('data: [DONE]\n');
    processor.finish();

    expect(tokens.join('')).toBe('Hello world');
  });

  // ── Error Handling ───────────────────────────────────────────────

  it('has error handling for uncaught exceptions and unhandled rejections (lesson 2)', () => {
    const cliPath = path.join(PROJECT, 'src/cli.ts');
    if (fs.existsSync(cliPath)) {
      const content = fs.readFileSync(cliPath, 'utf-8');
      expect(content).toMatch(/uncaughtException|catch|error/i);
      expect(content).toMatch(/unhandledRejection|rejection/i);
    }
    // Also check src/index.ts
    const indexPath = path.join(PROJECT, 'src/index.ts');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf-8');
      expect(content).toMatch(/catch|error/i);
    }
  });

  it('help output shows available commands (lesson 2)', () => {
    // Build must have produced dist/index.js
    const distIndex = path.join(PROJECT, 'dist/index.js');
    if (fs.existsSync(distIndex)) {
      const result = execSync(`node ${distIndex} --help`, {
        cwd: PROJECT,
        encoding: 'utf-8',
        timeout: 10000,
      });
      expect(result).toMatch(/chat|execute|pipe/i);
      expect(result).toMatch(/Usage|Commands|Options/i);
    }
  });
});

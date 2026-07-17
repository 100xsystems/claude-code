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
import { describe, it, expect, fileExists, readFile, fileMatches, expectBuildSucceeds, runCommand, importModule } from '@100xsystems/test-suite-typescript';

describe('Lesson 2: Build the CLI Tool', () => {

  // ── Cumulative: Project structure still works (lesson 1) ─────────

  it('builds successfully (cumulative: lesson 1)', () => {
    expectBuildSucceeds();
  });

  // ── CLI Structure ────────────────────────────────────────────────

  it('has src/cli.ts with chat, execute, and pipe commands (lesson 2)', () => {
    expect(fileExists('src/cli.ts')).toBe(true);
    const content = readFile('src/cli.ts');
    expect(content).toMatch(/chat/i);
    expect(content).toMatch(/execute/i);
    expect(content).toMatch(/pipe/i);
  });

  it('defines global CLI options like --model, --max-tokens, --temperature (lesson 2)', () => {
    const content = readFile('src/cli.ts');
    expect(content).toMatch(/model/i);
    expect(content).toMatch(/tokens/i);
    expect(content).toMatch(/temperature/i);
  });

  it('has src/llm/streaming.ts with SSE processing (lesson 2)', () => {
    expect(fileExists('src/llm/streaming.ts')).toBe(true);
    const content = readFile('src/llm/streaming.ts');
    expect(content).toMatch(/onToken|processChunk|delta|data:/i);
  });

  // ── Streaming Logic ──────────────────────────────────────────────

  it('StreamProcessor processes SSE chunks correctly (lesson 2)', async () => {
    const { StreamProcessor } = await importModule('llm/streaming.js');

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
    if (fileExists('src/cli.ts')) {
      const content = readFile('src/cli.ts');
      expect(content).toMatch(/uncaughtException|catch|error/i);
      expect(content).toMatch(/unhandledRejection|rejection/i);
    }
    if (fileExists('src/index.ts')) {
      const content = readFile('src/index.ts');
      expect(content).toMatch(/catch|error/i);
    }
  });

  it('help output shows available commands (lesson 2)', () => {
    if (fileExists('dist/index.js')) {
      const result = runCommand('node dist/index.js --help', 10000);
      expect(result).toMatch(/chat|execute|pipe/i);
      expect(result).toMatch(/Usage|Commands|Options/i);
    }
  });
});

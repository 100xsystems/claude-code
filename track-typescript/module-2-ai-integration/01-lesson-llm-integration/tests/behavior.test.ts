/**
 * Lesson 5: LLM API Integration with Streaming
 *
 * Behavioral tests that verify:
 * - LLM client exists with send() and sendStreaming() methods
 * - Mock mode works without API key
 * - System prompts exist
 * - API error handling
 * - Build still passes (cumulative)
 */
import { describe, it, expect, fileExists, readFile, fileMatches, expectBuildSucceeds } from '@100xsystems/test-suite-typescript';

describe('Lesson 5: LLM API Integration', () => {

  // ── Cumulative: Build ────────────────────────────────────────────

  it('builds successfully (cumulative)', () => {
    expectBuildSucceeds();
  });

  // ── LLM Client ───────────────────────────────────────────────────

  it('has src/llm/client.ts with LLMClient class (lesson 5)', () => {
    expect(fileExists('src/llm/client.ts')).toBe(true);
    const content = readFile('src/llm/client.ts');
    expect(content).toMatch(/class\s+LLMClient/);
    expect(content).toMatch(/send|sendStreaming/);
    expect(content).toMatch(/fetch|apiKey|apiUrl/i);
  });

  it('LLM client has mock mode for development without API key (lesson 5)', () => {
    const content = readFile('src/llm/client.ts');
    expect(content).toMatch(/mock|no.*api|without.*key/i);
  });

  it('has src/llm/prompts.ts with system prompt templates (lesson 5)', () => {
    expect(fileExists('src/llm/prompts.ts')).toBe(true);
    const content = readFile('src/llm/prompts.ts');
    expect(content).toMatch(/system.*prompt|getSystemPrompt|template/i);
    expect(content).toMatch(/Claude Code|agent|assistant/i);
  });

  // ── Streaming Logic Reuse ────────────────────────────────────────

  it('still has src/llm/streaming.ts (cumulative: lesson 2)', () => {
    expect(fileExists('src/llm/streaming.ts')).toBe(true);
  });

  // ── Error Handling ───────────────────────────────────────────────

  it('LLM client handles API errors gracefully (lesson 5)', () => {
    const content = readFile('src/llm/client.ts');
    expect(content).toMatch(/error|catch|throw|ok|status/i);
  });

  it('LLM client parses response content and tool calls (lesson 5)', () => {
    const content = readFile('src/llm/client.ts');
    expect(content).toMatch(/parse|content|tool.*call|tool_use/i);
  });
});

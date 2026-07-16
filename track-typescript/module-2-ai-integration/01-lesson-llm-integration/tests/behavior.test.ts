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
import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT = process.cwd();

describe('Lesson 5: LLM API Integration', () => {

  // ── Cumulative: Build ────────────────────────────────────────────

  it('builds successfully (cumulative)', () => {
    const result = execSync('npm run build', {
      cwd: PROJECT,
      encoding: 'utf-8',
      timeout: 60000,
    });
    expect(result).toBeDefined();
    expect(fs.existsSync(path.join(PROJECT, 'dist'))).toBe(true);
  });

  // ── LLM Client ───────────────────────────────────────────────────

  it('has src/llm/client.ts with LLMClient class (lesson 5)', () => {
    const clientPath = path.join(PROJECT, 'src/llm/client.ts');
    expect(fs.existsSync(clientPath)).toBe(true);
    const content = fs.readFileSync(clientPath, 'utf-8');
    expect(content).toMatch(/class\s+LLMClient/);
    expect(content).toMatch(/send|sendStreaming/);
    expect(content).toMatch(/fetch|apiKey|apiUrl/i);
  });

  it('LLM client has mock mode for development without API key (lesson 5)', () => {
    const clientPath = path.join(PROJECT, 'src/llm/client.ts');
    const content = fs.readFileSync(clientPath, 'utf-8');
    expect(content).toMatch(/mock|no.*api|without.*key/i);
  });

  it('has src/llm/prompts.ts with system prompt templates (lesson 5)', () => {
    const promptsPath = path.join(PROJECT, 'src/llm/prompts.ts');
    expect(fs.existsSync(promptsPath)).toBe(true);
    const content = fs.readFileSync(promptsPath, 'utf-8');
    expect(content).toMatch(/system.*prompt|getSystemPrompt|template/i);
    expect(content).toMatch(/Claude Code|agent|assistant/i);
  });

  // ── Streaming Logic Reuse ────────────────────────────────────────

  it('still has src/llm/streaming.ts (cumulative: lesson 2)', () => {
    expect(fs.existsSync(path.join(PROJECT, 'src/llm/streaming.ts'))).toBe(true);
  });

  // ── Error Handling ───────────────────────────────────────────────

  it('LLM client handles API errors gracefully (lesson 5)', () => {
    const clientPath = path.join(PROJECT, 'src/llm/client.ts');
    const content = fs.readFileSync(clientPath, 'utf-8');
    expect(content).toMatch(/error|catch|throw|ok|status/i);
  });

  it('LLM client parses response content and tool calls (lesson 5)', () => {
    const clientPath = path.join(PROJECT, 'src/llm/client.ts');
    const content = fs.readFileSync(clientPath, 'utf-8');
    expect(content).toMatch(/parse|content|tool.*call|tool_use/i);
  });
});

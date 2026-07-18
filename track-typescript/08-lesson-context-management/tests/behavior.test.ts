/**
 * Lesson 6: Context Window & Token Management
 *
 * Behavioral tests that verify:
 * - Token estimation logic exists
 * - Context manager has pruning logic
 * - Build still passes
 */
import { describe, it, expect, fileExists, readFile, expectBuildSucceeds } from '@100xsystems/test-suite-typescript';

describe('Lesson 6: Context Window & Token Management', () => {

  it('builds successfully (cumulative)', () => {
    expectBuildSucceeds();
  });

  it('has src/llm/context.ts with ContextManager class and pruning logic (lesson 6)', () => {
    expect(fileExists('src/llm/context.ts')).toBe(true);
    const content = readFile('src/llm/context.ts');
    expect(content).toMatch(/class\s+ContextManager/);
    expect(content).toMatch(/prune|pruneHistory/);
    expect(content).toMatch(/calculateUsage|estimateTokens/);
  });

  it('has src/llm/tokens.ts with token estimation (lesson 6)', () => {
    expect(fileExists('src/llm/tokens.ts')).toBe(true);
    const content = readFile('src/llm/tokens.ts');
    expect(content).toMatch(/estimateTokens|estimateMessageTokens/);
  });
});

/**
 * Lesson 6: Context Window & Token Management
 *
 * Behavioral tests that verify:
 * - Token estimation logic exists
 * - Context manager has pruning logic
 * - Build still passes
 */
import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT = process.cwd();

describe('Lesson 6: Context Window & Token Management', () => {

  it('builds successfully (cumulative)', () => {
    const result = execSync('npm run build', { cwd: PROJECT, encoding: 'utf-8', timeout: 60000 });
    expect(result).toBeDefined();
  });

  it('has src/llm/context.ts with ContextManager class and pruning logic (lesson 6)', () => {
    const ctxPath = path.join(PROJECT, 'src/llm/context.ts');
    expect(fs.existsSync(ctxPath)).toBe(true);
    const content = fs.readFileSync(ctxPath, 'utf-8');
    expect(content).toMatch(/class\s+ContextManager/);
    expect(content).toMatch(/prune|pruneHistory/);
    expect(content).toMatch(/calculateUsage|estimateTokens/);
  });

  it('has src/llm/tokens.ts with token estimation (lesson 6)', () => {
    const tokensPath = path.join(PROJECT, 'src/llm/tokens.ts');
    expect(fs.existsSync(tokensPath)).toBe(true);
    const content = fs.readFileSync(tokensPath, 'utf-8');
    expect(content).toMatch(/estimateTokens|estimateMessageTokens/);
  });
});

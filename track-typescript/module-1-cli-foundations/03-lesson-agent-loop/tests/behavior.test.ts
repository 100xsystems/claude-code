/**
 * Lesson 3: The Agent Loop: Think → Act → Observe
 *
 * Behavioral tests that verify:
 * - Agent types define Message, ToolCall, ToolResult, AgentConfig
 * - Agent loop exists with runLoop, executeToolCall methods
 * - ToolRegistry can register, get, execute tools
 * - Max iterations limit prevents infinite loops
 * - Build still passes (cumulative)
 */
import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT = process.cwd();

describe('Lesson 3: The Agent Loop', () => {

  // ── Cumulative: Build still works ────────────────────────────────

  it('builds successfully (cumulative)', () => {
    const result = execSync('npm run build', {
      cwd: PROJECT,
      encoding: 'utf-8',
      timeout: 60000,
    });
    expect(result).toBeDefined();
    expect(fs.existsSync(path.join(PROJECT, 'dist'))).toBe(true);
  });

  // ── Agent Types ──────────────────────────────────────────────────

  it('has src/agent/types.ts with Message, ToolCall, ToolResult, AgentConfig (lesson 3)', () => {
    const typesPath = path.join(PROJECT, 'src/agent/types.ts');
    expect(fs.existsSync(typesPath)).toBe(true);
    const content = fs.readFileSync(typesPath, 'utf-8');
    expect(content).toMatch(/interface\s+Message/);
    expect(content).toMatch(/interface\s+ToolCall|type\s+ToolCall/);
    expect(content).toMatch(/interface\s+ToolResult/);
    expect(content).toMatch(/interface\s+AgentConfig/);
    expect(content).toMatch(/ExecutionResult/);
  });

  it('defines AgentRole type and proper message structure (lesson 3)', () => {
    const typesPath = path.join(PROJECT, 'src/agent/types.ts');
    const content = fs.readFileSync(typesPath, 'utf-8');
    expect(content).toMatch(/role.*user.*assistant.*tool|AgentRole/);
    expect(content).toMatch(/content.*string/);
    expect(content).toMatch(/toolCallId/);
  });

  // ── Agent Loop ───────────────────────────────────────────────────

  it('has src/agent/loop.ts with Agent class (lesson 3)', () => {
    const loopPath = path.join(PROJECT, 'src/agent/loop.ts');
    expect(fs.existsSync(loopPath)).toBe(true);
    const content = fs.readFileSync(loopPath, 'utf-8');
    expect(content).toMatch(/class\s+Agent/);
    expect(content).toMatch(/runLoop|start|executeTask/);
    expect(content).toMatch(/messages|tools|llm/);
  });

  it('agent loop has max tool iterations to prevent infinite loops (lesson 3)', () => {
    const loopPath = path.join(PROJECT, 'src/agent/loop.ts');
    const content = fs.readFileSync(loopPath, 'utf-8');
    expect(content).toMatch(/max.*iterations|max.*loops|iterations/i);
  });

  // ── Tool Registry ────────────────────────────────────────────────

  it('has src/tools/registry.ts with Tool interface and ToolRegistry class (lesson 3)', () => {
    const regPath = path.join(PROJECT, 'src/tools/registry.ts');
    expect(fs.existsSync(regPath)).toBe(true);
    const content = fs.readFileSync(regPath, 'utf-8');
    expect(content).toMatch(/interface\s+Tool/);
    expect(content).toMatch(/class\s+ToolRegistry/);
    expect(content).toMatch(/register|execute|getToolSchemas/);
  });

  // ── Behavioral: ToolRegistry can register and execute tools ──────

  it('ToolRegistry can register, get, and execute tools (lesson 3)', async () => {
    const { ToolRegistry } = await import(path.join(PROJECT, 'dist/tools/registry.js'));

    const registry = new ToolRegistry();

    // Register a test tool
    registry.register({
      name: 'echo',
      description: 'Echoes input back',
      inputSchema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
        required: ['message'],
      },
      async execute(input: Record<string, unknown>) {
        return { echoed: input.message };
      },
    });

    // Verify it's registered
    const tool = registry.get('echo');
    expect(tool).toBeDefined();
    expect(tool!.name).toBe('echo');

    // Execute it
    const result = await registry.execute('echo', { message: 'hello' });
    expect(result).toEqual({ echoed: 'hello' });

    // Tool schemas should be returned
    const schemas = registry.getToolSchemas();
    expect(schemas.length).toBeGreaterThanOrEqual(1);
    expect(schemas[0].name).toBe('echo');
  });

  it('ToolRegistry throws for unknown tools (lesson 3)', async () => {
    const { ToolRegistry } = await import(path.join(PROJECT, 'dist/tools/registry.js'));
    const registry = new ToolRegistry();

    await expect(registry.execute('nonexistent', {}))
      .rejects.toThrow(/unknown.*tool|not.*found/i);
  });
});

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
import { describe, it, expect, fileExists, readFile, fileMatches, expectBuildSucceeds, importModule } from '@100xsystems/test-suite-typescript';

describe('Lesson 3: The Agent Loop', () => {

  // ── Cumulative: Build still works ────────────────────────────────

  it('builds successfully (cumulative)', () => {
    expectBuildSucceeds();
  });

  // ── Agent Types ──────────────────────────────────────────────────

  it('has src/agent/types.ts with Message, ToolCall, ToolResult, AgentConfig (lesson 3)', () => {
    expect(fileExists('src/agent/types.ts')).toBe(true);
    const content = readFile('src/agent/types.ts');
    expect(content).toMatch(/interface\s+Message/);
    expect(content).toMatch(/interface\s+ToolCall|type\s+ToolCall/);
    expect(content).toMatch(/interface\s+ToolResult/);
    expect(content).toMatch(/interface\s+AgentConfig/);
    expect(content).toMatch(/ExecutionResult/);
  });

  it('defines AgentRole type and proper message structure (lesson 3)', () => {
    const content = readFile('src/agent/types.ts');
    expect(content).toMatch(/role.*user.*assistant.*tool|AgentRole/);
    expect(content).toMatch(/content.*string/);
    expect(content).toMatch(/toolCallId/);
  });

  // ── Agent Loop ───────────────────────────────────────────────────

  it('has src/agent/loop.ts with Agent class (lesson 3)', () => {
    expect(fileExists('src/agent/loop.ts')).toBe(true);
    const content = readFile('src/agent/loop.ts');
    expect(content).toMatch(/class\s+Agent/);
    expect(content).toMatch(/runLoop|start|executeTask/);
    expect(content).toMatch(/messages|tools|llm/);
  });

  it('agent loop has max tool iterations to prevent infinite loops (lesson 3)', () => {
    const content = readFile('src/agent/loop.ts');
    expect(content).toMatch(/max.*iterations|max.*loops|iterations/i);
  });

  // ── Tool Registry ────────────────────────────────────────────────

  it('has src/tools/registry.ts with Tool interface and ToolRegistry class (lesson 3)', () => {
    expect(fileExists('src/tools/registry.ts')).toBe(true);
    const content = readFile('src/tools/registry.ts');
    expect(content).toMatch(/interface\s+Tool/);
    expect(content).toMatch(/class\s+ToolRegistry/);
    expect(content).toMatch(/register|execute|getToolSchemas/);
  });

  // ── Behavioral: ToolRegistry can register and execute tools ──────

  it('ToolRegistry can register, get, and execute tools (lesson 3)', async () => {
    const { ToolRegistry } = await importModule('tools/registry.js');

    const registry = new ToolRegistry();

    // Register a test tool
    registry.register({
      name: 'echo',
      description: 'Echoes input back',
      inputSchema: {
        type: 'object',
        properties: { message: { type: 'string' } },
        required: ['message'],
      },
      async execute(input: Record<string, unknown>) {
        return { echoed: input.message };
      },
    });

    const tool = registry.get('echo');
    expect(tool).toBeDefined();
    expect(tool!.name).toBe('echo');

    const result = await registry.execute('echo', { message: 'hello' });
    expect(result).toEqual({ echoed: 'hello' });

    const schemas = registry.getToolSchemas();
    expect(schemas.length).toBeGreaterThanOrEqual(1);
    expect(schemas[0].name).toBe('echo');
  });

  it('ToolRegistry throws for unknown tools (lesson 3)', async () => {
    const { ToolRegistry } = await importModule('tools/registry.js');
    const registry = new ToolRegistry();

    await expect(registry.execute('nonexistent', {}))
      .rejects.toThrow(/unknown.*tool|not.*found/i);
  });
});

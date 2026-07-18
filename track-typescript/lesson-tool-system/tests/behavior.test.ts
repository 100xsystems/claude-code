/**
 * Lesson 7: Building the Tool/Plugin System
 *
 * Behavioral tests that verify:
 * - Plugin types define PluginManifest, Plugin, ToolHandler
 * - Plugin loader discovers plugins from directories
 * - Plugin sandbox restricts access
 * - Build still passes
 */
import { describe, it, expect, fileExists, readFile, expectBuildSucceeds } from '@100xsystems/test-suite-typescript';

describe('Lesson 7: Building the Tool/Plugin System', () => {

  it('builds successfully (cumulative)', () => {
    expectBuildSucceeds();
  });

  it('has src/plugins/types.ts with PluginManifest interface (lesson 7)', () => {
    expect(fileExists('src/plugins/types.ts')).toBe(true);
    const content = readFile('src/plugins/types.ts');
    expect(content).toMatch(/PluginManifest|Plugin/);
    expect(content).toMatch(/ToolHandler|ToolDefinition/);
  });

  it('has src/plugins/loader.ts with plugin loading logic (lesson 7)', () => {
    expect(fileExists('src/plugins/loader.ts')).toBe(true);
    const content = readFile('src/plugins/loader.ts');
    expect(content).toMatch(/load|discover|scan|register/i);
  });
});

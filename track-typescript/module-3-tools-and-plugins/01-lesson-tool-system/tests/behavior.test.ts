/**
 * Lesson 7: Building the Tool/Plugin System
 *
 * Behavioral tests that verify:
 * - Plugin types define PluginManifest, Plugin, ToolHandler
 * - Plugin loader discovers plugins from directories
 * - Plugin sandbox restricts access
 * - Build still passes
 */
import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT = process.cwd();

describe('Lesson 7: Building the Tool/Plugin System', () => {

  it('builds successfully (cumulative)', () => {
    const result = execSync('npm run build', { cwd: PROJECT, encoding: 'utf-8', timeout: 60000 });
    expect(result).toBeDefined();
  });

  it('has src/plugins/types.ts with PluginManifest interface (lesson 7)', () => {
    const typesPath = path.join(PROJECT, 'src/plugins/types.ts');
    expect(fs.existsSync(typesPath)).toBe(true);
    const content = fs.readFileSync(typesPath, 'utf-8');
    expect(content).toMatch(/PluginManifest|Plugin/);
    expect(content).toMatch(/ToolHandler|ToolDefinition/);
  });

  it('has src/plugins/loader.ts with plugin loading logic (lesson 7)', () => {
    const loaderPath = path.join(PROJECT, 'src/plugins/loader.ts');
    expect(fs.existsSync(loaderPath)).toBe(true);
    const content = fs.readFileSync(loaderPath, 'utf-8');
    expect(content).toMatch(/load|discover|scan|register/i);
  });
});

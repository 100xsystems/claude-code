/**
 * Lesson 1: Introduction & Project Setup
 *
 * Behavioral tests that verify:
 * - Project structure exists (package.json, tsconfig.json, src/)
 * - Build script works (npm run build)
 * - Entry points are defined (src/index.ts, src/cli.ts)
 * - Required directories exist (agent/, tools/, llm/)
 */
import { describe, it, expect, fileExists, readJson, fileMatches, expectBuildSucceeds, projectPath } from '@100xsystems/test-suite-typescript';

const SRC = projectPath('src');

describe('Lesson 1: Introduction & Project Setup', () => {

  // ── Structure Checks ─────────────────────────────────────────────

  it('has a package.json with build script (lesson 1)', () => {
    expect(fileExists('package.json')).toBe(true);
    const pkg = readJson('package.json');
    expect(pkg.scripts?.build).toBeDefined();
    expect(pkg.scripts.build).toBeTruthy();
  });

  it('has a valid tsconfig.json (lesson 1)', () => {
    expect(fileExists('tsconfig.json')).toBe(true);
    const tsconfig = readJson('tsconfig.json');
    expect(tsconfig.compilerOptions).toBeDefined();
    expect(tsconfig.compilerOptions.outDir || tsconfig.compilerOptions.rootDir).toBeDefined();
  });

  it('has src/index.ts with an entry point (lesson 1)', () => {
    expect(fileExists('src/index.ts')).toBe(true);
    expect(fileMatches('src/index.ts', /createCLI|main|run|start/i)).toBe(true);
  });

  it('has src/cli.ts with a CLI definition (lesson 1)', () => {
    expect(fileExists('src/cli.ts')).toBe(true);
    expect(fileMatches('src/cli.ts', /Command|program|yargs|meow/i)).toBe(true);
  });

  it('has required directories: src/agent/, src/tools/, src/llm/ (lesson 1)', () => {
    expect(fileExists('src/agent')).toBe(true);
    expect(fileExists('src/tools')).toBe(true);
    expect(fileExists('src/llm')).toBe(true);
  });

  // ── Build Check ──────────────────────────────────────────────────

  it('builds successfully with npm run build (lesson 1)', () => {
    expectBuildSucceeds();
  });
});

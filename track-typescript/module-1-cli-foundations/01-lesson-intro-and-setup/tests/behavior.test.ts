/**
 * Lesson 1: Introduction & Project Setup
 *
 * Behavioral tests that verify:
 * - Project structure exists (package.json, tsconfig.json, src/)
 * - Build script works (npm run build)
 * - Entry points are defined (src/index.ts, src/cli.ts)
 * - Required directories exist (agent/, tools/, llm/)
 */
import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT = process.cwd();
const SRC = path.join(PROJECT, 'src');

describe('Lesson 1: Introduction & Project Setup', () => {

  // ── Structure Checks ─────────────────────────────────────────────

  it('has a package.json with build script (lesson 1)', () => {
    const pkgPath = path.join(PROJECT, 'package.json');
    expect(fs.existsSync(pkgPath)).toBe(true);
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    expect(pkg.scripts?.build).toBeDefined();
    expect(pkg.scripts.build).toBeTruthy();
  });

  it('has a valid tsconfig.json (lesson 1)', () => {
    const tsconfigPath = path.join(PROJECT, 'tsconfig.json');
    expect(fs.existsSync(tsconfigPath)).toBe(true);
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
    expect(tsconfig.compilerOptions).toBeDefined();
    expect(tsconfig.compilerOptions.outDir || tsconfig.compilerOptions.rootDir).toBeDefined();
  });

  it('has src/index.ts with an entry point (lesson 1)', () => {
    const indexPath = path.join(SRC, 'index.ts');
    expect(fs.existsSync(indexPath)).toBe(true);
    const content = fs.readFileSync(indexPath, 'utf-8');
    expect(content).toMatch(/createCLI|main|run|start/i);
  });

  it('has src/cli.ts with a CLI definition (lesson 1)', () => {
    const cliPath = path.join(SRC, 'cli.ts');
    expect(fs.existsSync(cliPath)).toBe(true);
    const content = fs.readFileSync(cliPath, 'utf-8');
    expect(content).toMatch(/Command|program|yargs|meow/i);
  });

  it('has required directories: src/agent/, src/tools/, src/llm/ (lesson 1)', () => {
    expect(fs.existsSync(path.join(SRC, 'agent'))).toBe(true);
    expect(fs.existsSync(path.join(SRC, 'tools'))).toBe(true);
    expect(fs.existsSync(path.join(SRC, 'llm'))).toBe(true);
  });

  // ── Build Check ──────────────────────────────────────────────────

  it('builds successfully with npm run build (lesson 1)', () => {
    const result = execSync('npm run build', {
      cwd: PROJECT,
      encoding: 'utf-8',
      timeout: 60000,
    });
    expect(result).toBeDefined();
    // Verify output directory was created
    const distDir = path.join(PROJECT, 'dist');
    expect(fs.existsSync(distDir)).toBe(true);
    const distFiles = fs.readdirSync(distDir);
    expect(distFiles.length).toBeGreaterThan(0);
  });
});

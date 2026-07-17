/**
 * Lesson 4: Implement File & System Tools
 *
 * Behavioral tests that verify:
 * - File system tools exist (read_file, write_file, list_files)
 * - Command execution tool exists
 * - Search/grep tool exists
 * - Path traversal prevention is implemented
 * - All tools are registered in the registry
 * - Build still passes (cumulative)
 */
import { describe, it, expect, fileExists, readFile, fileMatches, expectBuildSucceeds, importModule, projectPath, listDir } from '@100xsystems/test-suite-typescript';
import fs from 'fs';
import path from 'path';

describe('Lesson 4: Implement File & System Tools', () => {

  // ── Cumulative: Build still works ────────────────────────────────

  it('builds successfully (cumulative)', () => {
    expectBuildSucceeds();
  });

  // ── File System Tools ────────────────────────────────────────────

  it('has src/tools/filesystem.ts with read, write, and list tools (lesson 4)', () => {
    expect(fileExists('src/tools/filesystem.ts')).toBe(true);
    const content = readFile('src/tools/filesystem.ts');
    expect(content).toMatch(/read.*file|readFile/i);
    expect(content).toMatch(/write.*file|writeFile/i);
    expect(content).toMatch(/list.*file|listFiles|readdir/i);
  });

  it('file system tools implement path traversal prevention (lesson 4)', () => {
    const content = readFile('src/tools/filesystem.ts');
    expect(content).toMatch(/safePath|traversal|sanitize|normalize|resolve/i);
    expect(content).toMatch(/PROJECT_ROOT|process\.cwd\(\)|root/i);
  });

  // ── Command Execution Tool ───────────────────────────────────────

  it('has src/tools/execute.ts with command execution tool (lesson 4)', () => {
    expect(fileExists('src/tools/execute.ts')).toBe(true);
    const content = readFile('src/tools/execute.ts');
    expect(content).toMatch(/execute.*command|exec|spawn/i);
    expect(content).toMatch(/stdout|stderr|exitCode/i);
    expect(content).toMatch(/timeout/i);
  });

  // ── Search Tool ──────────────────────────────────────────────────

  it('has src/tools/search.ts with code search tool (lesson 4)', () => {
    expect(fileExists('src/tools/search.ts')).toBe(true);
    const content = readFile('src/tools/search.ts');
    expect(content).toMatch(/search|rgrep|grep|find/i);
    expect(content).toMatch(/pattern|match/i);
  });

  // ── Tool Registration ────────────────────────────────────────────

  it('all tools are registered in the registry (lesson 4)', () => {
    const regContent = readFile('src/tools/registry.ts');
    expect(regContent).toMatch(/register/i);

    const allSrcFiles = listDir('src', '.ts');
    const allContent = allSrcFiles.map((f: string) => {
      try { return readFile('src', f); }
      catch { return ''; }
    }).join('\n');

    expect(allContent).toMatch(/\.register\s*\(/);
  });

  // ── Behavioral: Read file tool implementation ────────────────────

  it('read_file tool reads files correctly (lesson 4)', async () => {
    const { readFileTool } = await importModule('tools/filesystem.js');

    const testFile = projectPath('.test-tmp-read.txt');
    fs.writeFileSync(testFile, 'hello world', 'utf-8');

    try {
      const result = await readFileTool.execute({ path: '.test-tmp-read.txt' }) as any;
      expect(result).toBeDefined();
      if (typeof result === 'object' && result.content) {
        expect(result.content).toContain('hello world');
      }
    } finally {
      try { fs.unlinkSync(testFile); } catch {}
    }
  });

  it('write_file tool creates files and directories (lesson 4)', async () => {
    const { writeFileTool } = await importModule('tools/filesystem.js');

    const testPath = '.test-tmp-dir/test-write.txt';
    const testContent = 'written content';

    try {
      await writeFileTool.execute({ path: testPath, content: testContent });
      expect(fileExists(testPath)).toBe(true);
      expect(readFile(testPath)).toBe(testContent);
    } finally {
      try {
        fs.unlinkSync(projectPath(testPath));
        fs.rmdirSync(projectPath('.test-tmp-dir'));
      } catch {}
    }
  });
});

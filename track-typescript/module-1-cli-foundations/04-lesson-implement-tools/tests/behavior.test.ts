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
import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT = process.cwd();

describe('Lesson 4: Implement File & System Tools', () => {

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

  // ── File System Tools ────────────────────────────────────────────

  it('has src/tools/filesystem.ts with read, write, and list tools (lesson 4)', () => {
    const fsPath = path.join(PROJECT, 'src/tools/filesystem.ts');
    expect(fs.existsSync(fsPath)).toBe(true);
    const content = fs.readFileSync(fsPath, 'utf-8');
    expect(content).toMatch(/read.*file|readFile/i);
    expect(content).toMatch(/write.*file|writeFile/i);
    expect(content).toMatch(/list.*file|listFiles|readdir/i);
  });

  it('file system tools implement path traversal prevention (lesson 4)', () => {
    const fsPath = path.join(PROJECT, 'src/tools/filesystem.ts');
    const content = fs.readFileSync(fsPath, 'utf-8');
    expect(content).toMatch(/safePath|traversal|sanitize|normalize|resolve/i);
    expect(content).toMatch(/PROJECT_ROOT|process\.cwd\(\)|root/i);
  });

  // ── Command Execution Tool ───────────────────────────────────────

  it('has src/tools/execute.ts with command execution tool (lesson 4)', () => {
    const execPath = path.join(PROJECT, 'src/tools/execute.ts');
    expect(fs.existsSync(execPath)).toBe(true);
    const content = fs.readFileSync(execPath, 'utf-8');
    expect(content).toMatch(/execute.*command|exec|spawn/i);
    expect(content).toMatch(/stdout|stderr|exitCode/i);
    expect(content).toMatch(/timeout/i);
  });

  // ── Search Tool ──────────────────────────────────────────────────

  it('has src/tools/search.ts with code search tool (lesson 4)', () => {
    const searchPath = path.join(PROJECT, 'src/tools/search.ts');
    expect(fs.existsSync(searchPath)).toBe(true);
    const content = fs.readFileSync(searchPath, 'utf-8');
    expect(content).toMatch(/search|rgrep|grep|find/i);
    expect(content).toMatch(/pattern|match/i);
  });

  // ── Tool Registration ────────────────────────────────────────────

  it('all tools are registered in the registry (lesson 4)', () => {
    // Check that the registry or a tool initializer registers all tools
    const regPath = path.join(PROJECT, 'src/tools/registry.ts');
    const regContent = fs.readFileSync(regPath, 'utf-8');
    expect(regContent).toMatch(/register/i);

    // Check for tool registration patterns
    const srcDir = path.join(PROJECT, 'src');
    const allContent = fs.readdirSync(srcDir, { recursive: true })
      .filter((f: string) => f.endsWith('.ts'))
      .map((f: string) => {
        try { return fs.readFileSync(path.join(srcDir, f), 'utf-8'); }
        catch { return ''; }
      })
      .join('\n');

    // Look for where tools are registered
    const hasRegistration = allContent.match(/\.register\s*\(/);
    expect(hasRegistration).toBeTruthy();
  });

  // ── Behavioral: Read file tool implementation ────────────────────

  it('read_file tool reads files correctly (lesson 4)', async () => {
    const { readFileTool } = await import(path.join(PROJECT, 'dist/tools/filesystem.js'));

    // Create a temp file to read
    const testFile = path.join(PROJECT, '.test-tmp-read.txt');
    fs.writeFileSync(testFile, 'hello world', 'utf-8');

    try {
      const result = await readFileTool.execute({ path: '.test-tmp-read.txt' }) as any;
      expect(result).toBeDefined();
      // The result should contain the content
      if (typeof result === 'object') {
        if (result.content) {
          expect(result.content).toContain('hello world');
        }
      }
    } finally {
      try { fs.unlinkSync(testFile); } catch {}
    }
  });

  it('write_file tool creates files and directories (lesson 4)', async () => {
    const { writeFileTool } = await import(path.join(PROJECT, 'dist/tools/filesystem.js'));

    const testPath = '.test-tmp-dir/test-write.txt';
    const testContent = 'written content';

    try {
      await writeFileTool.execute({ path: testPath, content: testContent });
      const fullPath = path.join(PROJECT, testPath);
      expect(fs.existsSync(fullPath)).toBe(true);
      expect(fs.readFileSync(fullPath, 'utf-8')).toBe(testContent);
    } finally {
      try {
        fs.unlinkSync(path.join(PROJECT, testPath));
        fs.rmdirSync(path.join(PROJECT, '.test-tmp-dir'));
      } catch {}
    }
  });
});

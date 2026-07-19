/**
 * Filesystem tools for the Claude Code agent.
 * Provides file read, write, and directory listing capabilities
 * with path traversal protection.
 */

import fs from 'fs';
import path from 'path';

/**
 * Sanitize a path to prevent directory traversal attacks.
 * Resolves the full path and ensures it stays within the project root.
 */
function safePath(input: string): string {
  const projectRoot = process.cwd();
  const resolved = path.resolve(projectRoot, input);
  if (!resolved.startsWith(projectRoot)) {
    throw new Error(`Path traversal detected: ${input} resolves outside project root`);
  }
  return resolved;
}

/**
 * Read a file's contents as a string.
 */
export async function readFile(input: { path: string }): Promise<string> {
  const filePath = safePath(input.path);
  const content = fs.readFileSync(filePath, 'utf-8');
  return content;
}

/**
 * Write content to a file, creating parent directories if needed.
 */
export async function writeFile(input: { path: string; content: string }): Promise<string> {
  const filePath = safePath(input.path);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, input.content, 'utf-8');
  return `Written ${Buffer.byteLength(input.content, 'utf-8')} bytes to ${input.path}`;
}

/**
 * List files and directories in a given path.
 */
export async function listFiles(input: { path: string }): Promise<string> {
  const dirPath = safePath(input.path);
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const results = entries.map((entry) => {
    const type = entry.isDirectory() ? 'dir' : 'file';
    return `${type}: ${entry.name}`;
  });
  return results.join('\n');
}

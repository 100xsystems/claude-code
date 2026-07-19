/**
 * Codebase search tool for the Claude Code agent.
 * Provides text search across project files (grep-like).
 */

import fs from 'fs';
import path from 'path';

const EXCLUDED_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'coverage']);

/**
 * Search for a pattern across all source files in the project.
 * Returns matching file paths with line numbers and content.
 */
export async function searchCode(input: { pattern: string; path?: string }): Promise<string> {
  const searchPath = input.path || process.cwd();
  const root = path.resolve(searchPath);
  const results: string[] = [];

  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') || EXCLUDED_DIRS.has(entry.name)) continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile()) {
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].includes(input.pattern)) {
                const relative = path.relative(root, fullPath);
                results.push(`${relative}:${i + 1}: ${lines[i].trim()}`);
              }
            }
          } catch {
            // Skip unreadable files
          }
        }
      }
    } catch {
      // Skip unreadable directories
    }
  }

  walk(root);

  if (results.length === 0) {
    return `No matches found for pattern: ${input.pattern}`;
  }

  return results.slice(0, 50).join('\n');
}

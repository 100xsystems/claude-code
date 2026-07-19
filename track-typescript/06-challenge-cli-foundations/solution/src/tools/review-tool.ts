/**
 * Code Review Tool — challenge implementation for CLI Foundations.
 *
 * Analyzes source files for quality issues and returns a structured JSON report:
 * - Functions exceeding 50 lines
 * - Nesting deeper than 3 levels
 * - Missing error handling
 * - Hardcoded values
 * - TODO/FIXME comments
 */

import fs from 'fs';
import path from 'path';

const SUPPORTED_EXTENSIONS = new Set(['.ts', '.js', '.py', '.java', '.go', '.rs']);

interface ReviewIssue {
  type: string;
  line: number;
  severity: 'low' | 'medium' | 'high';
  message: string;
}

interface ReviewReport {
  fileName: string;
  fileSize: number;
  issues: ReviewIssue[];
  summary: {
    high: number;
    medium: number;
    low: number;
    total: number;
  };
}

/**
 * Analyze a source file for code quality issues.
 */
export async function reviewCode(input: { path: string }): Promise<string> {
  const filePath = path.resolve(process.cwd(), input.path);

  if (!fs.existsSync(filePath)) {
    return JSON.stringify({ error: `File not found: ${input.path}` }, null, 2);
  }

  const ext = path.extname(filePath);
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    return JSON.stringify({
      error: `Unsupported file extension: ${ext}. Supported: ${Array.from(SUPPORTED_EXTENSIONS).join(', ')}`,
    }, null, 2);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const fileSize = Buffer.byteLength(content, 'utf-8');
  const issues: ReviewIssue[] = [];

  // Check 1: Functions exceeding 50 lines
  checkFunctionLength(lines, issues);

  // Check 2: Nesting deeper than 3 levels
  checkNestingDepth(lines, issues);

  // Check 3: Missing error handling (try/catch or .catch)
  checkErrorHandling(content, lines, issues);

  // Check 4: Hardcoded values (magic numbers)
  checkHardcodedValues(lines, issues);

  // Check 5: TODO/FIXME comments
  checkTodos(content, lines, issues);

  const summary = {
    high: issues.filter((i) => i.severity === 'high').length,
    medium: issues.filter((i) => i.severity === 'medium').length,
    low: issues.filter((i) => i.severity === 'low').length,
    total: issues.length,
  };

  const report: ReviewReport = {
    fileName: path.basename(filePath),
    fileSize,
    issues,
    summary,
  };

  return JSON.stringify(report, null, 2);
}

/**
 * Detect functions that exceed 50 lines.
 */
function checkFunctionLength(lines: string[], issues: ReviewIssue[]): void {
  const funcStartRegex = /(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s*)?\(|class\s+\w+)/;
  const endRegex = /^\s*\}\s*;?\s*$/;

  let funcStartLine = -1;
  let braceCount = 0;
  let inFunc = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!inFunc && funcStartRegex.test(line)) {
      funcStartLine = i;
      inFunc = true;
      braceCount = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
    } else if (inFunc) {
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;

      if (braceCount <= 0 && endRegex.test(line)) {
        const funcLength = i - funcStartLine + 1;
        if (funcLength > 50) {
          issues.push({
            type: 'long-function',
            line: funcStartLine + 1,
            severity: 'medium',
            message: `Function spans ${funcLength} lines (max: 50). Consider refactoring into smaller functions.`,
          });
        }
        inFunc = false;
      }
    }
  }
}

/**
 * Detect code nesting deeper than 3 levels.
 */
function checkNestingDepth(lines: string[], issues: ReviewIssue[]): void {
  let depth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;

    // Indentation-based depth check
    const indent = line.search(/\S/);
    if (indent > 0) {
      const indentDepth = Math.floor(indent / 2);
      if (indentDepth > 3 && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
        issues.push({
          type: 'deep-nesting',
          line: i + 1,
          severity: 'medium',
          message: `Code is nested ${indentDepth} levels deep (max: 3). Consider extracting into a separate function.`,
        });
      }
    }

    depth += openBraces - closeBraces;
  }
}

/**
 * Detect missing error handling patterns.
 */
function checkErrorHandling(content: string, lines: string[], issues: ReviewIssue[]): void {
  // Check for file I/O operations without try/catch
  const ioPatterns = [/fs\.readFileSync/, /fs\.writeFileSync/, /fs\.readdirSync/, /JSON\.parse/];
  const hasTryCatch = content.includes('try') && content.includes('catch');

  for (let i = 0; i < lines.length; i++) {
    for (const pattern of ioPatterns) {
      if (pattern.test(lines[i])) {
        // Check if this line is within a try block
        const contextStart = Math.max(0, i - 5);
        const context = lines.slice(contextStart, i + 1).join('\n');
        if (!context.includes('try')) {
          issues.push({
            type: 'missing-error-handling',
            line: i + 1,
            severity: 'high',
            message: `File/JSON operation without try/catch. Wrap in try-catch to handle errors gracefully.`,
          });
        }
      }
    }
  }

  // Check for async operations without .catch()
  const asyncPattern = /await\s+\w+/;
  const hasCatchChain = content.includes('.catch(');

  for (let i = 0; i < lines.length; i++) {
    if (asyncPattern.test(lines[i])) {
      const contextStart = Math.max(0, i - 3);
      const context = lines.slice(contextStart, i + 1).join('\n');
      if (!context.includes('try') && !hasCatchChain) {
        issues.push({
          type: 'missing-error-handling',
          line: i + 1,
          severity: 'high',
          message: `Async operation without error handling. Wrap in try-catch or add .catch() handler.`,
        });
      }
    }
  }
}

/**
 * Detect hardcoded numeric values (magic numbers).
 */
function checkHardcodedValues(lines: string[], issues: ReviewIssue[]): void {
  // Match standalone numbers that look like magic constants
  const magicNumberRegex = /\b(?:[3-9]\d{2,}|1000|[2-9]\d{3,})\b(?!\s*['"]?(?:ms|px|rem|em|%|px|s)?\s*$)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Skip comments, imports, and common patterns
    if (line.startsWith('//') || line.startsWith('*') || line.startsWith('import') || line.startsWith('export')) continue;
    if (line.includes('timeout') || line.includes('port') || line.includes('PORT')) continue;

    const match = line.match(magicNumberRegex);
    if (match) {
      issues.push({
        type: 'hardcoded-value',
        line: i + 1,
        severity: 'low',
        message: `Hardcoded value "${match[0]}" found. Consider using a named constant or configuration variable.`,
      });
    }
  }
}

/**
 * Detect TODO and FIXME comments.
 */
function checkTodos(content: string, lines: string[], issues: ReviewIssue[]): void {
  const todoRegex = /\/\/\s*(TODO|FIXME|HACK|XXX|TEMP)/gi;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(todoRegex);
    if (match) {
      for (const m of match) {
        issues.push({
          type: 'todo-comment',
          line: i + 1,
          severity: 'low',
          message: `${m.toUpperCase()} comment found. Address before finalizing code.`,
        });
      }
    }
  }
}

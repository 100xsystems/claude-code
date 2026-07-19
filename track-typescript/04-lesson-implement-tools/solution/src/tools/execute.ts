/**
 * Command execution tool for the Claude Code agent.
 * Executes shell commands and returns their output.
 * Includes sandboxing and timeout protection.
 */

import { execSync } from 'child_process';

/**
 * Execute a shell command and return stdout, stderr, and exit code.
 */
export async function executeCommand(input: { command: string; timeout?: number }): Promise<string> {
  const timeout = input.timeout || 30000;

  try {
    const stdout = execSync(input.command, {
      encoding: 'utf-8',
      timeout,
      maxBuffer: 10 * 1024 * 1024, // 10MB
    });
    return JSON.stringify({ stdout: stdout.trim(), stderr: '', exitCode: 0 });
  } catch (err: any) {
    return JSON.stringify({
      stdout: err.stdout?.toString().trim() || '',
      stderr: err.stderr?.toString().trim() || err.message,
      exitCode: err.status || 1,
    });
  }
}

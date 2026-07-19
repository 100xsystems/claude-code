import { Command } from 'commander';
import fs from 'fs';
import { StreamProcessor } from './llm/streaming.js';

export function createCLI() {
  const program = new Command();

  program
    .name('claude-code')
    .description('AI-powered coding agent')
    .version('0.1.0');

  // ── Chat Command (interactive) ──────────────────────────────
  program
    .command('chat')
    .description('Start an interactive chat session')
    .argument('[message]', 'Initial message')
    .option('--model <name>', 'LLM model', 'claude-3-opus-20240229')
    .option('--no-stream', 'Disable streaming output')
    .action(async (message?: string, opts?: { model?: string; stream?: boolean }) => {
      try {
        if (message) {
          console.log(`Processing: ${message}`);
          const processor = new StreamProcessor();
          await processor.process(message, opts?.stream ?? true);
        } else {
          console.log('Interactive chat session started. Type your messages.');
          console.log('Press Ctrl+C to exit.');
        }
      } catch (err) {
        console.error('Chat error:', err);
        process.exit(1);
      }
    });

  // ── Execute Command (single task) ───────────────────────────
  program
    .command('execute')
    .description('Execute a single instruction')
    .argument('<task>', 'Task description')
    .option('--model <name>', 'LLM model', 'claude-3-opus-20240229')
    .option('--no-stream', 'Disable streaming output')
    .action(async (task: string, opts?: { model?: string; stream?: boolean }) => {
      try {
        console.log(`Executing: ${task}`);
        const processor = new StreamProcessor();
        const result = await processor.process(task, opts?.stream ?? true);
        console.log('\n--- Result ---');
        console.log(result);
      } catch (err) {
        console.error('Execution error:', err);
        process.exit(1);
      }
    });

  // ── Pipe Command (stdin processing) ─────────────────────────
  program
    .command('pipe')
    .description('Process input from stdin')
    .option('--model <name>', 'LLM model', 'claude-3-opus-20240229')
    .option('--no-stream', 'Disable streaming output')
    .action(async (opts?: { model?: string; stream?: boolean }) => {
      try {
        const stdinContent = fs.readFileSync('/dev/stdin', 'utf-8').trim();
        if (stdinContent) {
          const processor = new StreamProcessor();
          const result = await processor.process(stdinContent, opts?.stream ?? true);
          console.log(result);
        } else {
          console.error('No input received from stdin.');
          process.exit(1);
        }
      } catch (err) {
        console.error('Pipe error:', err);
        process.exit(1);
      }
    });

  return program;
}

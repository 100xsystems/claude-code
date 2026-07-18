import { Command } from 'commander';

export function createCLI() {
  const program = new Command();

  program
    .name('claude-code')
    .description('AI-powered coding agent')
    .version('0.1.0')
    .option('--model <name>', 'LLM model to use', 'claude-3-opus-20240229')
    .option('--max-tokens <number>', 'Maximum tokens in response', '4096')
    .option('--temperature <number>', 'Sampling temperature', '0.7');

  program
    .command('chat')
    .description('Start an interactive chat session')
    .argument('[message]', 'Initial message to start the chat')
    .action(async (message?: string) => {
      try {
        console.log(`Chat session started${message ? ` with: ${message}` : ''}`);
      } catch (err) {
        console.error('Chat error:', err);
      }
    });

  program
    .command('execute')
    .description('Execute a single instruction')
    .argument('<task>', 'Task description to execute')
    .action(async (task: string) => {
      try {
        console.log(`Executing: ${task}`);
      } catch (err) {
        console.error('Execute error:', err);
      }
    });

  program
    .command('pipe')
    .description('Process piped input from stdin')
    .argument('[input]', 'Optional direct input string')
    .action(async (input?: string) => {
      try {
        if (input) {
          console.log(`Processing piped input: ${input.slice(0, 100)}...`);
        } else {
          console.log('Waiting for piped input...');
        }
      } catch (err) {
        console.error('Pipe error:', err);
      }
    });

  program.on('command:*', () => {
    console.error('Unknown command. See --help for available commands.');
    process.exit(1);
  });

  // Global rejection handler for promise rejections in CLI actions
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection in CLI:', reason);
  });

  return program;
}

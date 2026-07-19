import { Command } from 'commander';

export function createCLI() {
  const program = new Command();

  program
    .name('claude-code')
    .description('AI-powered coding agent')
    .version('0.1.0');

  program
    .command('chat')
    .description('Start an interactive chat session')
    .argument('[message]', 'Initial message')
    .action(async (message?: string) => {
      console.log('Chat session started' + (message ? ': ' + message : ''));
    });

  program
    .command('execute')
    .description('Execute a single instruction')
    .argument('<task>', 'Task description')
    .action(async (task: string) => {
      console.log('Executing: ' + task);
    });

  return program;
}

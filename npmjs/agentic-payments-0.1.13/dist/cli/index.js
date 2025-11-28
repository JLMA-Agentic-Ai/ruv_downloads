#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { generateCommand } from './commands/generate.js';
import { verifyCommand } from './commands/verify.js';
import { mandateCommand } from './commands/mandate.js';
import { systemCommand } from './commands/system.js';
import { completionCommand } from './completion.js';
import { activeMandateCommand } from './commands/active-mandate.js';
const program = new Command();
// Global error handler
process.on('uncaughtException', (error) => {
    console.error(chalk.red.bold('\n✗ Fatal Error:'), error.message);
    if (process.env.DEBUG) {
        console.error(chalk.gray(error.stack));
    }
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error(chalk.red.bold('\n✗ Unhandled Rejection:'), reason);
    process.exit(1);
});
// CLI Setup
program
    .name('agentic-payments')
    .description(chalk.cyan.bold('Agentic Payments') + ' - Multi-agent payment consensus system')
    .version('0.1.0', '-v, --version', 'Output the current version')
    .helpOption('-h, --help', 'Display help for command')
    .addHelpText('after', `

${chalk.bold('Examples:')}
  ${chalk.gray('# Generate a new agent identity')}
  $ agentic-payments generate --format json

  ${chalk.gray('# Verify a payment with consensus')}
  $ agentic-payments verify --amount 100 --agents 5

  ${chalk.gray('# Create an intent mandate')}
  $ agentic-payments mandate create intent --data payment.json

  ${chalk.gray('# Check system status')}
  $ agentic-payments system status

  ${chalk.gray('# Install shell completions')}
  $ agentic-payments completion install

${chalk.bold('Documentation:')}
  ${chalk.blue('https://github.com/yourusername/agentic-payments')}

${chalk.bold('Report Issues:')}
  ${chalk.blue('https://github.com/yourusername/agentic-payments/issues')}
`);
// Register commands
program.addCommand(generateCommand);
program.addCommand(verifyCommand);
program.addCommand(mandateCommand);
program.addCommand(activeMandateCommand);
program.addCommand(systemCommand);
program.addCommand(completionCommand);
// Global options
program
    .option('--debug', 'Enable debug output')
    .option('--no-color', 'Disable colored output')
    .hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.debug) {
        process.env.DEBUG = '1';
    }
    if (opts.noColor) {
        chalk.level = 0;
    }
});
// Parse and execute
program.parse(process.argv);
// Show help if no command provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
//# sourceMappingURL=index.js.map
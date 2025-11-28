import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { writeFile } from 'fs/promises';
import { AgentIdentity } from '../../identity.js';
export const generateCommand = new Command('generate')
    .alias('gen')
    .description('Generate a new agent identity with cryptographic keys')
    .option('-f, --format <type>', 'Output format: json, hex', 'json')
    .option('-o, --output <file>', 'Write to file instead of stdout')
    .option('--no-color', 'Disable colored output')
    .action(async (options) => {
    const spinner = ora({
        text: 'Generating agent identity...',
        color: 'cyan',
        spinner: 'dots'
    }).start();
    try {
        // Generate identity with native crypto
        const identity = await AgentIdentity.generate();
        spinner.succeed(chalk.green('Agent identity generated successfully'));
        // Format output
        let output;
        switch (options.format.toLowerCase()) {
            case 'json':
                output = JSON.stringify(identity.toJSON(), null, 2);
                break;
            case 'hex':
                const publicKeyHex = identity.publicKeyHex();
                const privateKeyHex = identity.privateKeyHex();
                output = `Public Key: ${publicKeyHex}\nPrivate Key: ${privateKeyHex}\nDID: ${identity.did()}`;
                break;
            default:
                throw new Error(`Unsupported format: ${options.format}`);
        }
        // Write to file or stdout
        if (options.output) {
            await writeFile(options.output, output, 'utf-8');
            console.log(chalk.blue(`\n✓ Identity saved to: ${options.output}`));
        }
        else {
            console.log('\n' + chalk.cyan.bold('Agent Identity:'));
            console.log(chalk.white(output));
        }
        // Display additional info
        console.log('\n' + chalk.yellow.bold('⚠ Security Notice:'));
        console.log(chalk.gray('  Keep the private key secure and never share it.'));
        console.log(chalk.gray('  Anyone with the private key can impersonate this agent.\n'));
    }
    catch (error) {
        spinner.fail(chalk.red('Failed to generate identity'));
        console.error(chalk.red('\nError:'), error.message);
        if (process.env.DEBUG) {
            console.error(chalk.gray(error.stack));
        }
        process.exit(1);
    }
});
//# sourceMappingURL=generate.js.map
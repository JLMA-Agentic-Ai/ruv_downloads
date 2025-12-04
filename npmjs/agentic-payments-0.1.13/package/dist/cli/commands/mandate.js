import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { readFile, writeFile } from 'fs/promises';
import { AgentIdentity } from '../../identity.js';
import { IntentMandate, CartMandate, PaymentMandate } from '../../mandate.js';
const mandateCommand = new Command('mandate')
    .description('Create, validate, and sign payment mandates');
// Create subcommand
mandateCommand
    .command('create')
    .description('Create a new mandate')
    .argument('<type>', 'Mandate type: intent, cart, payment')
    .option('-d, --data <json>', 'Mandate data as JSON string')
    .option('-f, --file <path>', 'Load mandate data from file')
    .option('-o, --output <file>', 'Save mandate to file')
    .action(async (type, options) => {
    const spinner = ora('Creating mandate...').start();
    try {
        // Load data
        let data = {};
        if (options.file) {
            const content = await readFile(options.file, 'utf-8');
            data = JSON.parse(content);
        }
        else if (options.data) {
            data = JSON.parse(options.data);
        }
        else {
            throw new Error('Either --data or --file must be provided');
        }
        // Create mandate based on type
        let mandate;
        switch (type.toLowerCase()) {
            case 'intent':
                mandate = new IntentMandate({
                    merchantId: data.merchantId || 'merchant-default',
                    customerId: data.customerId || 'customer-default',
                    intent: data.intent || 'Payment authorization',
                    maxAmount: data.maxAmount || data.amount || 100,
                    currency: data.currency || 'USD',
                    expiresAt: data.expiresAt || Date.now() + 86400000 // 24 hours
                });
                break;
            case 'cart':
                mandate = new CartMandate({
                    merchantId: data.merchantId || 'merchant-default',
                    customerId: data.customerId || 'customer-default',
                    items: data.items || [],
                    currency: data.currency || 'USD',
                    expiresAt: data.expiresAt || Date.now() + 86400000
                });
                break;
            case 'payment':
                mandate = new PaymentMandate({
                    sourceId: data.sourceId || 'source-default',
                    type: data.type || 'intent',
                    amount: data.amount || 100,
                    currency: data.currency || 'USD',
                    paymentMethod: data.paymentMethod || 'card'
                });
                break;
            default:
                throw new Error(`Unknown mandate type: ${type}`);
        }
        spinner.succeed(chalk.green(`${type.charAt(0).toUpperCase() + type.slice(1)} mandate created`));
        // Output
        const output = JSON.stringify(mandate.toJSON(), null, 2);
        if (options.output) {
            await writeFile(options.output, output, 'utf-8');
            console.log(chalk.blue(`\n✓ Mandate saved to: ${options.output}\n`));
        }
        else {
            console.log('\n' + chalk.cyan.bold('Mandate:'));
            console.log(chalk.white(output) + '\n');
        }
    }
    catch (error) {
        spinner.fail(chalk.red('Failed to create mandate'));
        console.error(chalk.red('\nError:'), error.message);
        process.exit(1);
    }
});
// Validate subcommand
mandateCommand
    .command('validate')
    .description('Validate a mandate')
    .option('-f, --file <path>', 'Mandate file to validate')
    .option('-d, --data <json>', 'Mandate data as JSON string')
    .option('-t, --type <type>', 'Mandate type: intent, cart, payment')
    .action(async (options) => {
    const spinner = ora('Validating mandate...').start();
    try {
        // Load mandate data
        let mandateData;
        if (options.file) {
            const content = await readFile(options.file, 'utf-8');
            mandateData = JSON.parse(content);
        }
        else if (options.data) {
            mandateData = JSON.parse(options.data);
        }
        else {
            throw new Error('Either --file or --data must be provided');
        }
        // Determine mandate type from data if not specified
        const type = options.type || mandateData.type || (mandateData.intent ? 'intent' : 'payment');
        // Create mandate object
        let mandate;
        switch (type.toLowerCase()) {
            case 'intent':
                mandate = new IntentMandate(mandateData);
                break;
            case 'cart':
                mandate = new CartMandate(mandateData);
                break;
            case 'payment':
                mandate = new PaymentMandate(mandateData);
                break;
            default:
                throw new Error(`Unknown mandate type: ${type}`);
        }
        // Validate
        const result = mandate.validate();
        spinner.stop();
        if (result.valid) {
            console.log(chalk.green.bold('\n✓ Mandate is valid\n'));
            console.log(chalk.gray(`  Type:      ${type}`));
            console.log(chalk.gray(`  ID:        ${mandateData.id}`));
            if (mandateData.signature) {
                console.log(chalk.gray(`  Signed:    Yes (by ${mandateData.signedBy || 'unknown'})`));
            }
            console.log();
            process.exit(0);
        }
        else {
            console.log(chalk.red.bold('\n✗ Mandate validation failed\n'));
            result.errors.forEach(error => console.log(chalk.red(`  • ${error}`)));
            console.log();
            process.exit(1);
        }
    }
    catch (error) {
        spinner.fail(chalk.red('Validation failed'));
        console.error(chalk.red('\nError:'), error.message);
        process.exit(1);
    }
});
// Sign subcommand
mandateCommand
    .command('sign')
    .description('Sign a mandate with agent credentials')
    .option('-f, --file <path>', 'Mandate file to sign')
    .option('-k, --key <hex>', 'Agent private key (hex)')
    .option('-j, --json <path>', 'Load agent identity from JSON file')
    .option('-t, --type <type>', 'Mandate type: intent, cart, payment')
    .option('-o, --output <file>', 'Save signed mandate to file')
    .action(async (options) => {
    const spinner = ora('Signing mandate...').start();
    try {
        if (!options.file) {
            throw new Error('--file is required');
        }
        if (!options.key && !options.json) {
            throw new Error('Either --key or --json is required');
        }
        // Load agent identity
        let agent;
        if (options.json) {
            const identityData = JSON.parse(await readFile(options.json, 'utf-8'));
            const publicKey = new Uint8Array(Object.values(identityData.publicKey));
            const privateKey = new Uint8Array(Object.values(identityData.privateKey));
            agent = await AgentIdentity.fromKeys(publicKey, privateKey);
        }
        else {
            const privateKeyBytes = new Uint8Array(options.key.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
            const ed = await import('@noble/ed25519');
            const publicKeyBytes = await ed.getPublicKeyAsync(privateKeyBytes);
            agent = await AgentIdentity.fromKeys(publicKeyBytes, privateKeyBytes);
        }
        // Load mandate
        const content = await readFile(options.file, 'utf-8');
        const mandateData = JSON.parse(content);
        // Determine mandate type
        const type = options.type || mandateData.type || (mandateData.intent ? 'intent' : 'payment');
        // Create mandate object and sign
        let mandate;
        switch (type.toLowerCase()) {
            case 'intent':
                mandate = new IntentMandate(mandateData);
                await mandate.sign(agent);
                break;
            case 'cart':
                mandate = new CartMandate(mandateData);
                await mandate.sign(agent);
                break;
            case 'payment':
                mandate = new PaymentMandate(mandateData);
                await mandate.sign(agent);
                break;
            default:
                throw new Error(`Unknown mandate type: ${type}`);
        }
        spinner.succeed(chalk.green('Mandate signed successfully'));
        // Output
        const output = JSON.stringify(mandate.toJSON(), null, 2);
        if (options.output) {
            await writeFile(options.output, output, 'utf-8');
            console.log(chalk.blue(`\n✓ Signed mandate saved to: ${options.output}\n`));
        }
        else {
            console.log('\n' + chalk.cyan.bold('Signed Mandate:'));
            console.log(chalk.white(output) + '\n');
        }
    }
    catch (error) {
        spinner.fail(chalk.red('Failed to sign mandate'));
        console.error(chalk.red('\nError:'), error.message);
        process.exit(1);
    }
});
export { mandateCommand };
//# sourceMappingURL=mandate.js.map
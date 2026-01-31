import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { readFile, writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { validateAndVerify, guardExecution, revoke, getAllRevocations, formatAmount, formatPeriod, copy } from '../../active-mandate/index.js';
import nacl from 'tweetnacl';
const activeMandateCommand = new Command('active-mandate')
    .alias('am')
    .description('Manage Active Mandates for autonomous agent payments');
// Create subcommand
activeMandateCommand
    .command('create')
    .description('Create a new Active Mandate')
    .requiredOption('-a, --agent <name>', 'Agent identifier (e.g., claude-shopbot@agentics)')
    .requiredOption('-h, --holder <name>', 'Holder/user identifier')
    .requiredOption('--amount <number>', 'Spend cap amount in minor units (e.g., 12000 = $120.00)', parseInt)
    .option('--currency <code>', 'Currency code', 'USD')
    .option('--period <type>', 'Spend period: single, daily, weekly, monthly', 'single')
    .option('-k, --kind <type>', 'Mandate kind: intent or cart', 'intent')
    .option('--merchant-allow <hosts>', 'Comma-separated list of allowed merchant hostnames')
    .option('--merchant-block <hosts>', 'Comma-separated list of blocked merchant hostnames')
    .option('--expires <iso>', 'Expiration date (ISO8601)', new Date(Date.now() + 86400000).toISOString())
    .option('--not-before <iso>', 'Not valid before date (ISO8601)')
    .option('-o, --output <file>', 'Save mandate to file')
    .action(async (options) => {
    const spinner = ora('Creating Active Mandate...').start();
    try {
        const mandateBody = {
            mandate_id: `mandate_${uuidv4()}`,
            kind: options.kind,
            agent: options.agent,
            holder: options.holder,
            cap: {
                amount: options.amount,
                currency: options.currency,
                period: options.period
            },
            expires_at: options.expires,
            ...(options.notBefore && { not_before: options.notBefore }),
            ...(options.merchantAllow && { merchant_allow: options.merchantAllow.split(',') }),
            ...(options.merchantBlock && { merchant_block: options.merchantBlock.split(',') })
        };
        spinner.succeed(chalk.green('Active Mandate created'));
        const output = JSON.stringify(mandateBody, null, 2);
        if (options.output) {
            await writeFile(options.output, output, 'utf-8');
            console.log(chalk.blue(`\n✓ Mandate saved to: ${options.output}`));
        }
        else {
            console.log('\n' + chalk.cyan.bold('Active Mandate:'));
            console.log(chalk.white(output));
        }
        // Display summary
        console.log('\n' + chalk.yellow.bold('Summary:'));
        console.log(chalk.gray(`  ${copy.en.mandateId}: ${mandateBody.mandate_id}`));
        console.log(chalk.gray(`  ${copy.en.agent}: ${mandateBody.agent}`));
        console.log(chalk.gray(`  ${copy.en.holder}: ${mandateBody.holder}`));
        console.log(chalk.gray(`  ${copy.en.spendCap}: ${formatAmount(mandateBody.cap.amount, mandateBody.cap.currency)} ${formatPeriod(mandateBody.cap.period)}`));
        console.log(chalk.gray(`  ${copy.en.expires}: ${new Date(mandateBody.expires_at).toLocaleString()}\n`));
    }
    catch (error) {
        spinner.fail(chalk.red('Failed to create mandate'));
        console.error(chalk.red('\nError:'), error.message);
        process.exit(1);
    }
});
// Sign subcommand
activeMandateCommand
    .command('sign')
    .description('Sign an Active Mandate with Ed25519')
    .requiredOption('-f, --file <path>', 'Mandate file to sign')
    .requiredOption('-k, --key <hex>', 'Private key (hex format, 64 bytes)')
    .option('-o, --output <file>', 'Save signed mandate to file')
    .action(async (options) => {
    const spinner = ora('Signing mandate...').start();
    try {
        // Load mandate
        const content = await readFile(options.file, 'utf-8');
        const mandateBody = JSON.parse(content);
        // Parse private key
        const keyHex = options.key.replace(/^0x/, '');
        const privateKeyBytes = new Uint8Array(keyHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
        if (privateKeyBytes.length !== 64) {
            throw new Error('Private key must be 64 bytes (128 hex characters)');
        }
        // Generate keypair and sign
        const keyPair = nacl.sign.keyPair.fromSecretKey(privateKeyBytes);
        // Import signing functions
        const { canonicalizeJSON } = await import('../../active-mandate/signing.js');
        const msg = canonicalizeJSON(mandateBody);
        const signature = nacl.sign.detached(msg, privateKeyBytes);
        const signedMandate = {
            alg: 'ed25519',
            pubkey: Buffer.from(keyPair.publicKey).toString('base64'),
            signature: Buffer.from(signature).toString('base64'),
            payload: mandateBody
        };
        spinner.succeed(chalk.green('Mandate signed successfully'));
        const output = JSON.stringify(signedMandate, null, 2);
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
// Verify subcommand
activeMandateCommand
    .command('verify')
    .description('Verify an Active Mandate signature and validity')
    .requiredOption('-f, --file <path>', 'Signed mandate file')
    .option('-v, --verbose', 'Show detailed validation results')
    .action(async (options) => {
    const spinner = ora('Verifying mandate...').start();
    try {
        const content = await readFile(options.file, 'utf-8');
        const signedMandate = JSON.parse(content);
        const result = validateAndVerify(signedMandate);
        spinner.stop();
        if (result.valid && result.parsed) {
            console.log(chalk.green.bold('\n✓ MANDATE VALID\n'));
            const guard = guardExecution(result.parsed);
            if (guard.allowed) {
                console.log(chalk.green('✓ Execution allowed'));
            }
            else {
                console.log(chalk.red(`✗ Execution blocked: ${guard.reason}`));
            }
            if (options.verbose) {
                console.log('\n' + chalk.white.bold('Mandate Details:'));
                console.log(chalk.gray(`  ${copy.en.mandateId}: ${result.parsed.payload.mandate_id}`));
                console.log(chalk.gray(`  ${copy.en.agent}: ${result.parsed.payload.agent}`));
                console.log(chalk.gray(`  ${copy.en.holder}: ${result.parsed.payload.holder}`));
                console.log(chalk.gray(`  ${copy.en.spendCap}: ${formatAmount(result.parsed.payload.cap.amount, result.parsed.payload.cap.currency)} ${formatPeriod(result.parsed.payload.cap.period)}`));
                console.log(chalk.gray(`  ${copy.en.expires}: ${new Date(result.parsed.payload.expires_at).toLocaleString()}`));
                if (result.parsed.payload.merchant_allow) {
                    console.log(chalk.gray(`  ${copy.en.allowed}: ${result.parsed.payload.merchant_allow.join(', ')}`));
                }
            }
            console.log();
            process.exit(0);
        }
        else {
            console.log(chalk.red.bold('\n✗ MANDATE INVALID\n'));
            console.log(chalk.red(`Reason: ${result.reason}\n`));
            process.exit(1);
        }
    }
    catch (error) {
        spinner.fail(chalk.red('Verification failed'));
        console.error(chalk.red('\nError:'), error.message);
        process.exit(1);
    }
});
// Revoke subcommand
activeMandateCommand
    .command('revoke')
    .description('Revoke an Active Mandate')
    .requiredOption('-i, --id <mandate_id>', 'Mandate ID to revoke')
    .option('-r, --reason <text>', 'Revocation reason')
    .action(async (options) => {
    const spinner = ora('Revoking mandate...').start();
    try {
        const record = revoke(options.id, options.reason);
        spinner.succeed(chalk.green('Mandate revoked'));
        console.log('\n' + chalk.yellow.bold('Revocation Record:'));
        console.log(chalk.gray(`  Mandate ID: ${record.mandate_id}`));
        console.log(chalk.gray(`  Revoked at: ${new Date(record.revoked_at).toLocaleString()}`));
        if (record.reason) {
            console.log(chalk.gray(`  Reason: ${record.reason}`));
        }
        console.log();
    }
    catch (error) {
        spinner.fail(chalk.red('Failed to revoke mandate'));
        console.error(chalk.red('\nError:'), error.message);
        process.exit(1);
    }
});
// List revocations subcommand
activeMandateCommand
    .command('revocations')
    .alias('list-revoked')
    .description('List all revoked mandates')
    .action(async () => {
    try {
        const revocations = getAllRevocations();
        if (revocations.length === 0) {
            console.log(chalk.gray('\nNo revoked mandates found.\n'));
            return;
        }
        console.log('\n' + chalk.cyan.bold(`Revoked Mandates (${revocations.length}):`));
        console.log(chalk.cyan.bold('═'.repeat(60)) + '\n');
        revocations.forEach((rec, idx) => {
            console.log(chalk.white(`${idx + 1}. ${rec.mandate_id}`));
            console.log(chalk.gray(`   Revoked: ${new Date(rec.revoked_at).toLocaleString()}`));
            if (rec.reason) {
                console.log(chalk.gray(`   Reason: ${rec.reason}`));
            }
            console.log();
        });
    }
    catch (error) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
    }
});
export { activeMandateCommand };
//# sourceMappingURL=active-mandate.js.map
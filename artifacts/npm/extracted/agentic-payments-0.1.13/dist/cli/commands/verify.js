import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { readFile } from 'fs/promises';
import { AgentIdentity } from '../../identity.js';
import { VerificationSystemBuilder } from '../../verification.js';
export const verifyCommand = new Command('verify')
    .description('Verify a signature using multi-agent consensus')
    .option('-s, --signature <hex>', 'Signature to verify (hex)')
    .option('-m, --message <text>', 'Message that was signed')
    .option('-p, --publicKey <hex>', 'Public key (hex)')
    .option('-n, --agents <count>', 'Number of verification agents', parseInt, 5)
    .option('-t, --threshold <value>', 'Consensus threshold (0.0-1.0)', parseFloat, 0.67)
    .option('-d, --data <file>', 'Load verification data from JSON file')
    .option('-v, --verbose', 'Show individual agent votes')
    .option('--parallel', 'Use parallel verification (default: true)', true)
    .action(async (options) => {
    const spinner = ora({
        text: 'Initializing verification system...',
        color: 'cyan',
        spinner: 'dots'
    }).start();
    try {
        // Load verification data
        let verificationData = {};
        if (options.data) {
            spinner.text = `Loading verification data from ${options.data}...`;
            const fileContent = await readFile(options.data, 'utf-8');
            verificationData = JSON.parse(fileContent);
        }
        else {
            if (!options.signature || !options.message || !options.publicKey) {
                throw new Error('Either --data or all of --signature, --message, --publicKey must be provided');
            }
            verificationData = {
                signature: options.signature,
                message: options.message,
                publicKey: options.publicKey
            };
        }
        // Parse signature and message
        const signatureBytes = new Uint8Array(verificationData.signature.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
        const messageBytes = new TextEncoder().encode(verificationData.message);
        const publicKeyBytes = new Uint8Array(verificationData.publicKey.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
        // Create verification agents
        spinner.text = `Creating ${options.agents} verification agents...`;
        const systemBuilder = new VerificationSystemBuilder()
            .consensusThreshold(options.threshold)
            .minAgents(options.agents)
            .maxAgents(options.agents)
            .parallel(options.parallel);
        // Generate agents
        for (let i = 0; i < options.agents; i++) {
            const agent = await AgentIdentity.generate();
            systemBuilder.addAgent(agent);
        }
        const system = systemBuilder.build();
        // Perform verification
        spinner.text = 'Running multi-agent consensus verification...';
        const startTime = Date.now();
        const result = await system.verifyWithConsensus(signatureBytes, messageBytes, publicKeyBytes);
        const duration = Date.now() - startTime;
        spinner.stop();
        // Display results
        console.log('\n' + chalk.cyan.bold('═══════════════════════════════════════'));
        console.log(chalk.cyan.bold('     CONSENSUS VERIFICATION RESULTS     '));
        console.log(chalk.cyan.bold('═══════════════════════════════════════\n'));
        // Consensus status
        if (result.consensusReached) {
            console.log(chalk.green.bold('✓ CONSENSUS REACHED'));
        }
        else {
            console.log(chalk.red.bold('✗ CONSENSUS FAILED'));
        }
        // Metrics
        console.log(chalk.white('\nMetrics:'));
        console.log(chalk.gray(`  Total Agents:        ${result.totalVotes}`));
        console.log(chalk.gray(`  Threshold:           ${(options.threshold * 100).toFixed(0)}%`));
        console.log(chalk.gray(`  Approvals:           ${result.votesFor}/${result.totalVotes} (${(result.consensusPercentage * 100).toFixed(1)}%)`));
        console.log(chalk.gray(`  Verification Time:   ${duration}ms`));
        console.log(chalk.gray(`  Avg Agent Latency:   ${result.avgLatencyMs.toFixed(1)}ms`));
        // Verbose output
        if (options.verbose) {
            console.log(chalk.white('\nAgent Votes:'));
            result.agentVotes.forEach((vote, idx) => {
                const symbol = vote.vote ? chalk.green('✓') : chalk.red('✗');
                const latency = chalk.gray(`(${vote.latencyMs}ms)`);
                console.log(`  ${symbol} Agent ${idx + 1} ${chalk.gray(vote.agentId.slice(0, 16))} ${latency}`);
            });
        }
        console.log(chalk.cyan.bold('\n═══════════════════════════════════════\n'));
        // Exit with appropriate code
        process.exit(result.consensusReached ? 0 : 1);
    }
    catch (error) {
        spinner.fail(chalk.red('Verification failed'));
        console.error(chalk.red('\nError:'), error.message);
        if (process.env.DEBUG) {
            console.error(chalk.gray(error.stack));
        }
        process.exit(1);
    }
});
//# sourceMappingURL=verify.js.map
import { Command } from 'commander';
import chalk from 'chalk';
import { getInfo } from '../../index.js';
const systemCommand = new Command('system')
    .alias('sys')
    .description('System management and information');
// Info subcommand
systemCommand
    .command('info')
    .description('Display system information')
    .action(async () => {
    try {
        const info = getInfo();
        console.log('\n' + chalk.cyan.bold('═══════════════════════════════════════'));
        console.log(chalk.cyan.bold('   AGENTIC PAYMENTS SYSTEM INFO'));
        console.log(chalk.cyan.bold('═══════════════════════════════════════\n'));
        console.log(chalk.white.bold('Implementation:'));
        console.log(chalk.gray(`  Type:        ${info.implementation}`));
        console.log(chalk.gray(`  Version:     ${info.version}`));
        console.log(chalk.white.bold('\nFeatures:'));
        info.features.forEach((feature) => {
            console.log(chalk.gray(`  • ${feature}`));
        });
        console.log(chalk.white.bold('\nRuntime:'));
        console.log(chalk.gray(`  Node:        ${process.version}`));
        console.log(chalk.gray(`  Platform:    ${process.platform}`));
        console.log(chalk.gray(`  Arch:        ${process.arch}`));
        console.log(chalk.white.bold('\nMemory:'));
        const mem = process.memoryUsage();
        console.log(chalk.gray(`  Heap Used:   ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`));
        console.log(chalk.gray(`  Heap Total:  ${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`));
        console.log(chalk.gray(`  RSS:         ${(mem.rss / 1024 / 1024).toFixed(2)} MB`));
        console.log('\n' + chalk.cyan.bold('═══════════════════════════════════════\n'));
    }
    catch (error) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
    }
});
// Status subcommand
systemCommand
    .command('status')
    .description('Display system status')
    .option('-w, --watch', 'Watch mode (update every 2s)')
    .action(async (options) => {
    const displayStatus = async () => {
        if (options.watch) {
            console.clear();
        }
        console.log(chalk.cyan.bold('╔═══════════════════════════════════════════════╗'));
        console.log(chalk.cyan.bold('║     AGENTIC PAYMENTS SYSTEM STATUS            ║'));
        console.log(chalk.cyan.bold('╚═══════════════════════════════════════════════╝\n'));
        // System health
        const uptime = process.uptime();
        const memUsage = process.memoryUsage();
        console.log(chalk.white.bold('System Health:'));
        console.log(chalk.gray(`  Status:           ${chalk.green('● Ready')}`));
        console.log(chalk.gray(`  Uptime:           ${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`));
        console.log(chalk.gray(`  Memory:           ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`));
        // Implementation info
        const info = getInfo();
        console.log(chalk.white.bold('\nImplementation:'));
        console.log(chalk.gray(`  Type:             ${info.implementation}`));
        console.log(chalk.gray(`  Version:          ${info.version}`));
        // Features
        console.log(chalk.white.bold('\nEnabled Features:'));
        info.features.forEach((feature) => {
            console.log(chalk.gray(`  • ${feature}`));
        });
        console.log('\n' + chalk.cyan.bold('═══════════════════════════════════════════════\n'));
        if (options.watch) {
            console.log(chalk.gray('Updating every 2s... (Press Ctrl+C to exit)'));
        }
    };
    try {
        if (options.watch) {
            await displayStatus();
            setInterval(displayStatus, 2000);
            await new Promise(() => { }); // Keep alive
        }
        else {
            await displayStatus();
        }
    }
    catch (error) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
    }
});
// Version subcommand
systemCommand
    .command('version')
    .alias('v')
    .description('Display version information')
    .action(() => {
    const info = getInfo();
    console.log(`\n${chalk.cyan.bold('Agentic Payments')} ${chalk.white('v' + info.version)}`);
    console.log(chalk.gray(`Implementation: ${info.implementation}\n`));
});
export { systemCommand };
//# sourceMappingURL=system.js.map
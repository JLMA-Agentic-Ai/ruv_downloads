import { Command } from 'commander';
import chalk from 'chalk';
import { readFile, writeFile, appendFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';
export const completionCommand = new Command('completion')
    .description('Manage shell completions');
// Detect current shell
function detectShell() {
    const shell = process.env.SHELL || '';
    if (shell.includes('bash'))
        return 'bash';
    if (shell.includes('zsh'))
        return 'zsh';
    if (shell.includes('fish'))
        return 'fish';
    return 'unknown';
}
// Get shell RC file path
function getShellRcPath(shell) {
    const home = homedir();
    switch (shell) {
        case 'bash':
            return join(home, '.bashrc');
        case 'zsh':
            return join(home, '.zshrc');
        case 'fish':
            return join(home, '.config', 'fish', 'config.fish');
        default:
            throw new Error(`Unsupported shell: ${shell}`);
    }
}
// Install subcommand
completionCommand
    .command('install')
    .description('Install shell completions for current shell')
    .option('-s, --shell <type>', 'Target shell: bash, zsh, fish')
    .option('--dry-run', 'Show what would be installed without making changes')
    .action(async (options) => {
    try {
        const shell = options.shell || detectShell();
        if (shell === 'unknown' && !options.shell) {
            console.error(chalk.red('\n✗ Could not detect shell'));
            console.log(chalk.yellow('  Please specify shell with --shell option\n'));
            process.exit(1);
        }
        console.log(chalk.cyan(`\nInstalling completions for ${shell}...\n`));
        const rcPath = getShellRcPath(shell);
        const completionScript = generateCompletionScript(shell);
        if (options.dryRun) {
            console.log(chalk.yellow('Dry run mode - no changes will be made\n'));
            console.log(chalk.gray('Would add to ' + rcPath + ':'));
            console.log(chalk.white(completionScript));
            console.log();
            return;
        }
        // Check if already installed
        try {
            const content = await readFile(rcPath, 'utf-8');
            if (content.includes('agentic-payments completion')) {
                console.log(chalk.yellow('✓ Completions already installed\n'));
                return;
            }
        }
        catch {
            // File doesn't exist, will be created
        }
        // Add completion source to RC file
        await appendFile(rcPath, '\n' + completionScript + '\n');
        console.log(chalk.green('✓ Completions installed successfully\n'));
        console.log(chalk.yellow('To activate completions, run:'));
        console.log(chalk.white(`  source ${rcPath}\n`));
        console.log(chalk.gray('Or restart your terminal session\n'));
    }
    catch (error) {
        console.error(chalk.red('\n✗ Installation failed:'), error.message);
        process.exit(1);
    }
});
// Uninstall subcommand
completionCommand
    .command('uninstall')
    .description('Remove shell completions')
    .option('-s, --shell <type>', 'Target shell: bash, zsh, fish')
    .action(async (options) => {
    try {
        const shell = options.shell || detectShell();
        const rcPath = getShellRcPath(shell);
        console.log(chalk.cyan(`\nRemoving completions from ${rcPath}...\n`));
        const content = await readFile(rcPath, 'utf-8');
        const lines = content.split('\n');
        const filtered = lines.filter(line => !line.includes('agentic-payments completion'));
        await writeFile(rcPath, filtered.join('\n'));
        console.log(chalk.green('✓ Completions removed\n'));
    }
    catch (error) {
        console.error(chalk.red('\n✗ Removal failed:'), error.message);
        process.exit(1);
    }
});
// Generate subcommand
completionCommand
    .command('generate')
    .description('Generate completion script for a shell')
    .argument('<shell>', 'Shell type: bash, zsh, fish')
    .action((shell) => {
    try {
        const script = generateCompletionScript(shell);
        console.log(script);
    }
    catch (error) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
    }
});
// Generate completion script
function generateCompletionScript(shell) {
    switch (shell) {
        case 'bash':
            return `# agentic-payments completion
_agentic_payments_completion() {
    local cur prev opts
    COMPREPLY=()
    cur="\${COMP_WORDS[COMP_CWORD]}"
    prev="\${COMP_WORDS[COMP_CWORD-1]}"

    case "\${prev}" in
        agentic-payments)
            opts="generate verify mandate system completion --help --version"
            COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
            return 0
            ;;
        generate|gen)
            opts="--format --output --seed --help"
            COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
            return 0
            ;;
        verify)
            opts="--amount --currency --agents --threshold --data --verbose --byzantine --help"
            COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
            return 0
            ;;
        mandate)
            opts="create validate sign --help"
            COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
            return 0
            ;;
        system|sys)
            opts="start stop status metrics --help"
            COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
            return 0
            ;;
    esac
}
complete -F _agentic_payments_completion agentic-payments`;
        case 'zsh':
            return `# agentic-payments completion
#compdef agentic-payments

_agentic_payments() {
    local -a commands
    commands=(
        'generate:Generate a new agent identity'
        'verify:Verify a payment using consensus'
        'mandate:Create and manage mandates'
        'system:System management'
        'completion:Manage shell completions'
    )

    _arguments -C \\
        '--help[Show help]' \\
        '--version[Show version]' \\
        '1: :->command' \\
        '*::arg:->args'

    case $state in
        command)
            _describe 'command' commands
            ;;
        args)
            case $words[1] in
                generate|gen)
                    _arguments \\
                        '--format[Output format]:format:(json hex pem)' \\
                        '--output[Output file]:file:_files' \\
                        '--seed[Seed for generation]:seed:' \\
                        '--help[Show help]'
                    ;;
                verify)
                    _arguments \\
                        '--amount[Payment amount]:amount:' \\
                        '--currency[Currency code]:currency:' \\
                        '--agents[Number of agents]:count:' \\
                        '--threshold[Consensus threshold]:threshold:' \\
                        '--data[Data file]:file:_files' \\
                        '--verbose[Verbose output]' \\
                        '--byzantine[Byzantine fault tolerance]' \\
                        '--help[Show help]'
                    ;;
            esac
            ;;
    esac
}

_agentic_payments`;
        case 'fish':
            return `# agentic-payments completion
complete -c agentic-payments -f

# Commands
complete -c agentic-payments -n "__fish_use_subcommand" -a "generate" -d "Generate agent identity"
complete -c agentic-payments -n "__fish_use_subcommand" -a "verify" -d "Verify payment"
complete -c agentic-payments -n "__fish_use_subcommand" -a "mandate" -d "Manage mandates"
complete -c agentic-payments -n "__fish_use_subcommand" -a "system" -d "System management"
complete -c agentic-payments -n "__fish_use_subcommand" -a "completion" -d "Shell completions"

# Generate options
complete -c agentic-payments -n "__fish_seen_subcommand_from generate" -l format -d "Output format" -a "json hex pem"
complete -c agentic-payments -n "__fish_seen_subcommand_from generate" -l output -d "Output file"
complete -c agentic-payments -n "__fish_seen_subcommand_from generate" -l seed -d "Generation seed"

# Verify options
complete -c agentic-payments -n "__fish_seen_subcommand_from verify" -l amount -d "Payment amount"
complete -c agentic-payments -n "__fish_seen_subcommand_from verify" -l currency -d "Currency code"
complete -c agentic-payments -n "__fish_seen_subcommand_from verify" -l agents -d "Number of agents"
complete -c agentic-payments -n "__fish_seen_subcommand_from verify" -l threshold -d "Consensus threshold"
complete -c agentic-payments -n "__fish_seen_subcommand_from verify" -l data -d "Data file"
complete -c agentic-payments -n "__fish_seen_subcommand_from verify" -l verbose -d "Verbose output"
complete -c agentic-payments -n "__fish_seen_subcommand_from verify" -l byzantine -d "Byzantine fault tolerance"

# Mandate subcommands
complete -c agentic-payments -n "__fish_seen_subcommand_from mandate" -a "create" -d "Create mandate"
complete -c agentic-payments -n "__fish_seen_subcommand_from mandate" -a "validate" -d "Validate mandate"
complete -c agentic-payments -n "__fish_seen_subcommand_from mandate" -a "sign" -d "Sign mandate"

# System subcommands
complete -c agentic-payments -n "__fish_seen_subcommand_from system" -a "start" -d "Start system"
complete -c agentic-payments -n "__fish_seen_subcommand_from system" -a "stop" -d "Stop system"
complete -c agentic-payments -n "__fish_seen_subcommand_from system" -a "status" -d "Show status"
complete -c agentic-payments -n "__fish_seen_subcommand_from system" -a "metrics" -d "Show metrics"`;
        default:
            throw new Error(`Unsupported shell: ${shell}`);
    }
}
//# sourceMappingURL=completion.js.map
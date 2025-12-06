/**
 * Logger utilities with colored output
 */
import chalk from 'chalk';
import boxen from 'boxen';
import gradient from 'gradient-string';
const agenticsGradient = gradient(['#6366f1', '#8b5cf6', '#a855f7']);
export const logger = {
    banner(text) {
        console.log(agenticsGradient(text));
    },
    info(message) {
        console.log(chalk.blue('ℹ'), message);
    },
    success(message) {
        console.log(chalk.green('✔'), message);
    },
    warning(message) {
        console.log(chalk.yellow('⚠'), message);
    },
    error(message) {
        console.log(chalk.red('✖'), message);
    },
    step(step, total, message) {
        console.log(chalk.cyan(`[${step}/${total}]`), message);
    },
    box(content, title) {
        console.log(boxen(content, {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: 'magenta',
            title: title,
            titleAlignment: 'center'
        }));
    },
    divider() {
        console.log(chalk.gray('─'.repeat(60)));
    },
    newline() {
        console.log();
    },
    link(text, url) {
        console.log(chalk.cyan.underline(`${text}: ${url}`));
    },
    list(items) {
        items.forEach(item => {
            console.log(chalk.gray('  •'), item);
        });
    },
    table(data) {
        const maxKeyLength = Math.max(...Object.keys(data).map(k => k.length));
        Object.entries(data).forEach(([key, value]) => {
            console.log(chalk.gray('  '), chalk.white(key.padEnd(maxKeyLength)), chalk.gray(':'), chalk.cyan(value));
        });
    }
};
//# sourceMappingURL=logger.js.map
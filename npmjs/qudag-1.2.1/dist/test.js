"use strict";
/**
 * QuDAG NPM Package Test Script
 * Verifies that the package is correctly installed and functional
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const chalk_1 = __importDefault(require("chalk"));
async function runTests() {
    console.log(chalk_1.default.blue.bold('\n🧪 QuDAG NPM Package Tests\n'));
    // Test 1: Check if binary is installed
    console.log(chalk_1.default.yellow('Test 1: Checking if binary is installed...'));
    const installed = (0, index_1.isInstalled)();
    if (installed) {
        console.log(chalk_1.default.green('✓ Binary is installed'));
    }
    else {
        console.log(chalk_1.default.red('✗ Binary is not installed'));
        return false;
    }
    // Test 2: Get platform information
    console.log(chalk_1.default.yellow('\nTest 2: Getting platform information...'));
    const platformInfo = (0, index_1.getPlatformInfo)();
    console.log(chalk_1.default.green('✓ Platform information retrieved:'));
    console.log(chalk_1.default.gray(`  Platform: ${platformInfo.platform}`));
    console.log(chalk_1.default.gray(`  Architecture: ${platformInfo.arch}`));
    console.log(chalk_1.default.gray(`  Target Triple: ${platformInfo.targetTriple}`));
    console.log(chalk_1.default.gray(`  Binary Path: ${platformInfo.binaryPath}`));
    // Test 3: Execute help command
    console.log(chalk_1.default.yellow('\nTest 3: Executing help command...'));
    try {
        const result = await index_1.QuDAG.raw(['--help']);
        if (result.code === 0) {
            console.log(chalk_1.default.green('✓ Help command executed successfully'));
            console.log(chalk_1.default.gray('\nOutput preview:'));
            const lines = result.stdout.split('\n').slice(0, 5);
            lines.forEach(line => console.log(chalk_1.default.gray(`  ${line}`)));
            console.log(chalk_1.default.gray('  ...\n'));
        }
        else {
            console.log(chalk_1.default.red('✗ Help command failed'));
            console.error(chalk_1.default.red(`Exit code: ${result.code}`));
            console.error(chalk_1.default.red(`Error: ${result.stderr}`));
            return false;
        }
    }
    catch (error) {
        console.log(chalk_1.default.red('✗ Failed to execute command'));
        console.error(chalk_1.default.red(`Error: ${error.message}`));
        return false;
    }
    // Test 4: Check version
    console.log(chalk_1.default.yellow('Test 4: Checking version...'));
    try {
        const result = await index_1.QuDAG.raw(['--version']);
        if (result.code === 0) {
            console.log(chalk_1.default.green('✓ Version command executed successfully'));
            console.log(chalk_1.default.gray(`  Version: ${result.stdout.trim()}`));
        }
        else {
            console.log(chalk_1.default.red('✗ Version command failed'));
            return false;
        }
    }
    catch (error) {
        console.log(chalk_1.default.red('✗ Failed to get version'));
        console.error(chalk_1.default.red(`Error: ${error.message}`));
        return false;
    }
    return true;
}
// Run tests
if (require.main === module) {
    runTests().then((success) => {
        if (success) {
            console.log(chalk_1.default.green.bold('\n✅ All tests passed!\n'));
            process.exit(0);
        }
        else {
            console.log(chalk_1.default.red.bold('\n❌ Some tests failed!\n'));
            process.exit(1);
        }
    }).catch((err) => {
        console.error(chalk_1.default.red.bold('\n❌ Test execution failed:'), err);
        process.exit(1);
    });
}
//# sourceMappingURL=test.js.map
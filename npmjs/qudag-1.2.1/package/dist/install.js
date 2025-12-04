"use strict";
/**
 * QuDAG NPM Package Installation Script
 * This script runs during npm install to download the appropriate binary
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const binary_manager_1 = require("./binary-manager");
const chalk_1 = __importDefault(require("chalk"));
async function install() {
    console.log(chalk_1.default.blue.bold('\n🌐 QuDAG Installation\n'));
    // Get platform information
    const platformInfo = (0, binary_manager_1.getPlatformInfo)();
    console.log(chalk_1.default.gray('Platform Information:'));
    console.log(chalk_1.default.gray(`  OS: ${platformInfo.platform}`));
    console.log(chalk_1.default.gray(`  Architecture: ${platformInfo.arch}`));
    console.log(chalk_1.default.gray(`  Target: ${platformInfo.targetTriple}`));
    console.log(chalk_1.default.gray(`  Binary: ${platformInfo.binaryName}\n`));
    try {
        // Ensure binary is installed
        await (0, binary_manager_1.ensureBinary)();
        console.log(chalk_1.default.green.bold('\n✅ QuDAG installation completed successfully!\n'));
        console.log(chalk_1.default.gray('You can now use QuDAG with:'));
        console.log(chalk_1.default.cyan('  npx qudag --help'));
        console.log(chalk_1.default.cyan('  qudag --help') + chalk_1.default.gray(' (if installed globally)\n'));
    }
    catch (error) {
        console.error(chalk_1.default.red.bold('\n❌ Installation failed:'), error.message);
        console.error(chalk_1.default.yellow('\nPlease try the following:'));
        console.error(chalk_1.default.gray('1. Check your internet connection'));
        console.error(chalk_1.default.gray('2. Verify that your platform is supported'));
        console.error(chalk_1.default.gray('3. Check if a release exists for your platform at:'));
        console.error(chalk_1.default.blue('   https://github.com/ruvnet/QuDAG/releases\n'));
        // Don't fail the npm install - allow the package to be installed
        // The binary will be downloaded on first use if needed
        console.log(chalk_1.default.yellow('⚠️  Warning: Binary not downloaded. It will be downloaded on first use.\n'));
    }
}
// Run installation
if (require.main === module) {
    install().catch((err) => {
        console.error('Unexpected error during installation:', err);
        process.exit(0); // Don't fail npm install
    });
}
//# sourceMappingURL=install.js.map
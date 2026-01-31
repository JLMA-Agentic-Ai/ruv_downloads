#!/usr/bin/env node
/**
 * Performance Monitor
 * Real-time monitoring of optimization performance with metrics tracking
 */
import { existsSync, writeFileSync, watch } from 'fs';
import { join } from 'path';
import { EventEmitter } from 'events';
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};
function log(color, prefix, message) {
    console.log(`${color}${prefix}${colors.reset} ${message}`);
}
class PerformanceMonitor extends EventEmitter {
    metrics = [];
    snapshots = [];
    monitoringInterval = null;
    dataPath = './examples/data';
    constructor() {
        super();
    }
    start() {
        log(colors.cyan, '[MONITOR]', 'Starting performance monitoring...');
        this.monitoringInterval = setInterval(() => {
            this.collectSnapshot();
        }, 5000); // Every 5 seconds
        // Watch for new optimization files
        this.watchOptimizationFiles();
        log(colors.green, '[MONITOR]', '✓ Monitoring started');
    }
    stop() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.saveReport();
        log(colors.green, '[MONITOR]', '✓ Monitoring stopped');
    }
    collectSnapshot() {
        const memUsage = process.memoryUsage();
        const snapshot = {
            timestamp: new Date().toISOString(),
            cpu: process.cpuUsage().user / 1000000, // Convert to seconds
            memory: memUsage.heapUsed / 1024 / 1024, // Convert to MB
            swarms: this.getSwarmStatus(),
            optimization: this.getOptimizationStatus()
        };
        this.snapshots.push(snapshot);
        // Keep only last 100 snapshots
        if (this.snapshots.length > 100) {
            this.snapshots.shift();
        }
        this.emit('snapshot', snapshot);
        this.printSnapshot(snapshot);
    }
    getSwarmStatus() {
        // Check parallel swarm execution data
        const swarmPath = join(this.dataPath, 'parallel-swarms');
        if (!existsSync(swarmPath)) {
            return { active: 0, completed: 0, failed: 0 };
        }
        // Would parse actual swarm data
        return { active: 0, completed: 0, failed: 0 };
    }
    getOptimizationStatus() {
        // Check latest optimization data
        const optPath = join(this.dataPath, 'optimization');
        if (!existsSync(optPath)) {
            return { currentScore: 0, bestScore: 0, convergence: 0 };
        }
        // Would parse actual optimization data
        return { currentScore: 0, bestScore: 0, convergence: 0 };
    }
    watchOptimizationFiles() {
        const optPath = join(this.dataPath, 'optimization');
        if (!existsSync(optPath)) {
            return;
        }
        watch(optPath, (eventType, filename) => {
            if (eventType === 'change' && filename) {
                log(colors.blue, '[MONITOR]', `Optimization file updated: ${filename}`);
                this.emit('optimizationUpdate', filename);
            }
        });
    }
    printSnapshot(snapshot) {
        console.clear();
        console.log(colors.bright + colors.cyan + '═══════════════════════════════════════════' + colors.reset);
        console.log(colors.bright + colors.cyan + '  Performance Monitor' + colors.reset);
        console.log(colors.bright + colors.cyan + '═══════════════════════════════════════════' + colors.reset);
        console.log('');
        console.log(colors.cyan + 'System Resources:' + colors.reset);
        console.log(`  CPU: ${snapshot.cpu.toFixed(2)}s`);
        console.log(`  Memory: ${snapshot.memory.toFixed(2)} MB`);
        console.log('');
        console.log(colors.cyan + 'Swarm Status:' + colors.reset);
        console.log(`  Active: ${snapshot.swarms.active}`);
        console.log(`  Completed: ${snapshot.swarms.completed}`);
        console.log(`  Failed: ${snapshot.swarms.failed}`);
        console.log('');
        console.log(colors.cyan + 'Optimization:' + colors.reset);
        console.log(`  Current Score: ${snapshot.optimization.currentScore.toFixed(4)}`);
        console.log(`  Best Score: ${snapshot.optimization.bestScore.toFixed(4)}`);
        console.log(`  Convergence: ${(snapshot.optimization.convergence * 100).toFixed(1)}%`);
        console.log('');
        console.log(colors.gray + `Last Update: ${snapshot.timestamp}` + colors.reset);
        console.log(colors.gray + 'Press Ctrl+C to stop monitoring' + colors.reset);
    }
    saveReport() {
        const reportPath = join(this.dataPath, 'monitoring', `monitor-${Date.now()}.json`);
        const report = {
            startTime: this.snapshots[0]?.timestamp,
            endTime: this.snapshots[this.snapshots.length - 1]?.timestamp,
            totalSnapshots: this.snapshots.length,
            snapshots: this.snapshots,
            summary: this.calculateSummary()
        };
        writeFileSync(reportPath, JSON.stringify(report, null, 2));
        log(colors.green, '[MONITOR]', `✓ Report saved: ${reportPath}`);
    }
    calculateSummary() {
        if (this.snapshots.length === 0) {
            return {};
        }
        const cpuValues = this.snapshots.map(s => s.cpu);
        const memoryValues = this.snapshots.map(s => s.memory);
        return {
            avgCpu: cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length,
            maxCpu: Math.max(...cpuValues),
            avgMemory: memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length,
            maxMemory: Math.max(...memoryValues)
        };
    }
}
// Main execution
async function main() {
    const monitor = new PerformanceMonitor();
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('');
        log(colors.yellow, '[MONITOR]', 'Shutting down...');
        monitor.stop();
        process.exit(0);
    });
    monitor.start();
    // Keep process alive
    await new Promise(() => { }); // Run forever until interrupted
}
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
    main().catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
export { PerformanceMonitor };
//# sourceMappingURL=performance-monitor.js.map
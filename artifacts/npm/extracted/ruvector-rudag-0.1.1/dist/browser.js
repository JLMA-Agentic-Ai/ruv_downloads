/**
 * Browser-specific entry point with IndexedDB support
 */
export * from './index';
// Re-export with browser-specific defaults
import { RuDag, DagStorage } from './index';
/**
 * Create a browser-optimized DAG with IndexedDB persistence
 */
export async function createBrowserDag(name) {
    const storage = new DagStorage();
    const dag = new RuDag({ name, storage });
    await dag.init();
    return dag;
}
/**
 * Browser storage manager for DAGs
 */
export class BrowserDagManager {
    constructor() {
        this.initialized = false;
        this.storage = new DagStorage();
    }
    async init() {
        if (this.initialized)
            return;
        await this.storage.init();
        this.initialized = true;
    }
    async createDag(name) {
        await this.init();
        const dag = new RuDag({ name, storage: this.storage });
        await dag.init();
        return dag;
    }
    async loadDag(id) {
        await this.init();
        return RuDag.load(id, this.storage);
    }
    async listDags() {
        await this.init();
        return this.storage.list();
    }
    async deleteDag(id) {
        await this.init();
        return this.storage.delete(id);
    }
    async clearAll() {
        await this.init();
        return this.storage.clear();
    }
    async getStats() {
        await this.init();
        return this.storage.stats();
    }
    close() {
        this.storage.close();
        this.initialized = false;
    }
}
//# sourceMappingURL=browser.js.map
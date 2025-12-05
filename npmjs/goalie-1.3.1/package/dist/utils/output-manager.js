/**
 * Output Manager for handling pagination and file exports
 */
import * as fs from 'fs/promises';
import * as path from 'path';
export class OutputManager {
    defaultResultsDir = '.research'; // Hidden folder by default
    /**
     * Get output directory based on options
     */
    getOutputDirectory(query, options) {
        let baseDir = options?.outputPath || this.defaultResultsDir;
        // Add query-based subfolder if requested
        if (options?.useQuerySubfolder) {
            const sanitizedQuery = query.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 30);
            baseDir = path.join(baseDir, sanitizedQuery);
        }
        return baseDir;
    }
    async ensureResultsDirectory(query, options) {
        const dir = this.getOutputDirectory(query, options);
        try {
            await fs.mkdir(dir, { recursive: true });
            return dir;
        }
        catch (error) {
            console.warn('Failed to create results directory:', error);
            return dir;
        }
    }
    /**
     * Paginate results
     */
    paginateResults(results, options) {
        const page = options?.page || 1;
        const pageSize = options?.pageSize || 10;
        // Handle array results
        if (Array.isArray(results)) {
            const totalItems = results.length;
            const totalPages = Math.ceil(totalItems / pageSize);
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            return {
                data: results.slice(startIndex, endIndex),
                pagination: {
                    page,
                    pageSize,
                    totalPages,
                    totalItems,
                    hasNext: page < totalPages,
                    hasPrevious: page > 1
                }
            };
        }
        // Handle SearchResult with citations
        if (results.citations && Array.isArray(results.citations)) {
            const totalItems = results.citations.length;
            const totalPages = Math.ceil(totalItems / pageSize);
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            return {
                data: {
                    ...results,
                    citations: results.citations.slice(startIndex, endIndex),
                    answer: page === 1 ? results.answer : `[Continued from page ${page}]\n${results.answer}`
                },
                pagination: {
                    page,
                    pageSize,
                    totalPages,
                    totalItems,
                    hasNext: page < totalPages,
                    hasPrevious: page > 1
                }
            };
        }
        // Return as-is if not paginatable
        return {
            data: results,
            pagination: {
                page: 1,
                pageSize: 1,
                totalPages: 1,
                totalItems: 1,
                hasNext: false,
                hasPrevious: false
            }
        };
    }
    /**
     * Save results to file
     */
    async saveToFile(results, query, format, options) {
        const dir = await this.ensureResultsDirectory(query, options);
        const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
        const sanitizedQuery = query.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50);
        const baseFilename = `${timestamp}_${sanitizedQuery}`;
        const savedFiles = [];
        // Save JSON
        if (format === 'json' || format === 'both') {
            const jsonPath = path.join(dir, `${baseFilename}.json`);
            await fs.writeFile(jsonPath, JSON.stringify(results, null, 2), 'utf-8');
            savedFiles.push(jsonPath);
        }
        // Save Markdown
        if (format === 'markdown' || format === 'both') {
            const mdPath = path.join(dir, `${baseFilename}.md`);
            const markdown = this.formatAsMarkdown(results, query);
            await fs.writeFile(mdPath, markdown, 'utf-8');
            savedFiles.push(mdPath);
        }
        // Also save a summary file in the parent directory if using subfolders
        if (options?.useQuerySubfolder) {
            const summaryPath = path.join(options.outputPath || this.defaultResultsDir, 'index.md');
            await this.updateSummaryFile(summaryPath, query, savedFiles);
        }
        return savedFiles;
    }
    /**
     * Update the summary index file
     */
    async updateSummaryFile(summaryPath, query, files) {
        try {
            let content = '';
            try {
                content = await fs.readFile(summaryPath, 'utf-8');
            }
            catch {
                content = '# Research Index\n\n';
            }
            const timestamp = new Date().toISOString();
            const entry = `\n## ${timestamp}\n**Query:** ${query}\n**Files:**\n${files.map(f => `- ${f}`).join('\n')}\n`;
            content += entry;
            await fs.writeFile(summaryPath, content, 'utf-8');
        }
        catch (error) {
            console.warn('Failed to update summary file:', error);
        }
    }
    /**
     * Format results as markdown
     */
    formatAsMarkdown(results, query) {
        const lines = [];
        lines.push(`# Search Results`);
        lines.push('');
        lines.push(`**Query:** ${query}`);
        lines.push(`**Date:** ${new Date().toISOString()}`);
        lines.push('');
        if (results.answer) {
            lines.push('## Answer');
            lines.push('');
            lines.push(results.answer);
            lines.push('');
        }
        if (results.citations && results.citations.length > 0) {
            lines.push('## Citations');
            lines.push('');
            results.citations.forEach((citation, index) => {
                lines.push(`### ${index + 1}. ${citation.title || 'Untitled'}`);
                lines.push('');
                if (citation.url)
                    lines.push(`**URL:** ${citation.url}`);
                if (citation.snippet) {
                    lines.push('');
                    lines.push(citation.snippet);
                }
                lines.push('');
            });
        }
        if (results.metadata) {
            lines.push('## Metadata');
            lines.push('');
            lines.push('```json');
            lines.push(JSON.stringify(results.metadata, null, 2));
            lines.push('```');
            lines.push('');
        }
        if (results.reasoning) {
            lines.push('## Reasoning Insights');
            lines.push('');
            if (results.reasoning.insights) {
                results.reasoning.insights.forEach((insight) => {
                    lines.push(`- ${insight}`);
                });
                lines.push('');
            }
            if (results.reasoning.confidence !== undefined) {
                lines.push(`**Confidence:** ${(results.reasoning.confidence * 100).toFixed(1)}%`);
                lines.push('');
            }
        }
        if (results.planLog && results.planLog.length > 0) {
            lines.push('## Planning Log');
            lines.push('');
            lines.push('```');
            results.planLog.forEach((log) => lines.push(log));
            lines.push('```');
            lines.push('');
        }
        return lines.join('\n');
    }
    /**
     * Create a summary for paginated results
     */
    createPaginationSummary(pagination) {
        return `Page ${pagination.page} of ${pagination.totalPages} (${pagination.totalItems} total items)`;
    }
}
//# sourceMappingURL=output-manager.js.map
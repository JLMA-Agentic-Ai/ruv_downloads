/**
 * @ruvector/ruvllm - Self-learning LLM orchestration
 *
 * RuvLLM combines SONA adaptive learning with HNSW memory,
 * FastGRNN routing, and SIMD-optimized inference.
 *
 * @example
 * ```typescript
 * import { RuvLLM, SessionManager, SonaCoordinator } from '@ruvector/ruvllm';
 *
 * const llm = new RuvLLM({ learningEnabled: true });
 * const sessions = new SessionManager(llm);
 * const sona = new SonaCoordinator();
 *
 * // Query with session context
 * const session = sessions.create();
 * const response = sessions.chat(session.id, 'What is AI?');
 *
 * // Track learning trajectory
 * const trajectory = new TrajectoryBuilder()
 *   .startStep('query', 'What is AI?')
 *   .endStep(response.text, response.confidence)
 *   .complete('success');
 *
 * sona.recordTrajectory(trajectory);
 * ```
 *
 * @example Federated Learning
 * ```typescript
 * import { EphemeralAgent, FederatedCoordinator } from '@ruvector/ruvllm';
 *
 * // Central coordinator
 * const coordinator = new FederatedCoordinator('coord-1');
 *
 * // Ephemeral agents process tasks and export
 * const agent = new EphemeralAgent('agent-1');
 * agent.processTask(embedding, 0.9);
 * const exportData = agent.exportState();
 *
 * // Aggregate learning
 * coordinator.aggregate(exportData);
 * ```
 *
 * @example LoRA Adapters
 * ```typescript
 * import { LoraAdapter, LoraManager } from '@ruvector/ruvllm';
 *
 * const adapter = new LoraAdapter({ rank: 8, alpha: 16 });
 * const output = adapter.forward(input);
 * ```
 */
// Core types
export * from './types';
// Main engine
export * from './engine';
// SIMD operations
export * from './simd';
// Session management
export * from './session';
// Streaming support
export * from './streaming';
// SONA learning system
export * from './sona';
// Federated learning
export * from './federated';
// LoRA adapters
export * from './lora';
// Export/serialization
export * from './export';
// Training pipeline
export * from './training';
// Contrastive fine-tuning
export * from './contrastive';
// Model downloader and registry
export * from './models';
// Benchmarks for Claude Code use cases
export * from './benchmarks';
// RLM - Retrieval Language Model
export * from './rlm';
// Native bindings utilities
export { version, hasSimdSupport } from './native';
// Default export
export { RuvLLM as default } from './engine';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0RHO0FBRUgsYUFBYTtBQUNiLGNBQWMsU0FBUyxDQUFDO0FBRXhCLGNBQWM7QUFDZCxjQUFjLFVBQVUsQ0FBQztBQUV6QixrQkFBa0I7QUFDbEIsY0FBYyxRQUFRLENBQUM7QUFFdkIscUJBQXFCO0FBQ3JCLGNBQWMsV0FBVyxDQUFDO0FBRTFCLG9CQUFvQjtBQUNwQixjQUFjLGFBQWEsQ0FBQztBQUU1Qix1QkFBdUI7QUFDdkIsY0FBYyxRQUFRLENBQUM7QUFFdkIscUJBQXFCO0FBQ3JCLGNBQWMsYUFBYSxDQUFDO0FBRTVCLGdCQUFnQjtBQUNoQixjQUFjLFFBQVEsQ0FBQztBQUV2Qix1QkFBdUI7QUFDdkIsY0FBYyxVQUFVLENBQUM7QUFFekIsb0JBQW9CO0FBQ3BCLGNBQWMsWUFBWSxDQUFDO0FBRTNCLDBCQUEwQjtBQUMxQixjQUFjLGVBQWUsQ0FBQztBQUU5QixnQ0FBZ0M7QUFDaEMsY0FBYyxVQUFVLENBQUM7QUFFekIsdUNBQXVDO0FBQ3ZDLGNBQWMsY0FBYyxDQUFDO0FBRTdCLGlDQUFpQztBQUNqQyxjQUFjLE9BQU8sQ0FBQztBQUV0Qiw0QkFBNEI7QUFDNUIsT0FBTyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFbkQsaUJBQWlCO0FBQ2pCLE9BQU8sRUFBRSxNQUFNLElBQUksT0FBTyxFQUFFLE1BQU0sVUFBVSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcnV2ZWN0b3IvcnV2bGxtIC0gU2VsZi1sZWFybmluZyBMTE0gb3JjaGVzdHJhdGlvblxuICpcbiAqIFJ1dkxMTSBjb21iaW5lcyBTT05BIGFkYXB0aXZlIGxlYXJuaW5nIHdpdGggSE5TVyBtZW1vcnksXG4gKiBGYXN0R1JOTiByb3V0aW5nLCBhbmQgU0lNRC1vcHRpbWl6ZWQgaW5mZXJlbmNlLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQgeyBSdXZMTE0sIFNlc3Npb25NYW5hZ2VyLCBTb25hQ29vcmRpbmF0b3IgfSBmcm9tICdAcnV2ZWN0b3IvcnV2bGxtJztcbiAqXG4gKiBjb25zdCBsbG0gPSBuZXcgUnV2TExNKHsgbGVhcm5pbmdFbmFibGVkOiB0cnVlIH0pO1xuICogY29uc3Qgc2Vzc2lvbnMgPSBuZXcgU2Vzc2lvbk1hbmFnZXIobGxtKTtcbiAqIGNvbnN0IHNvbmEgPSBuZXcgU29uYUNvb3JkaW5hdG9yKCk7XG4gKlxuICogLy8gUXVlcnkgd2l0aCBzZXNzaW9uIGNvbnRleHRcbiAqIGNvbnN0IHNlc3Npb24gPSBzZXNzaW9ucy5jcmVhdGUoKTtcbiAqIGNvbnN0IHJlc3BvbnNlID0gc2Vzc2lvbnMuY2hhdChzZXNzaW9uLmlkLCAnV2hhdCBpcyBBST8nKTtcbiAqXG4gKiAvLyBUcmFjayBsZWFybmluZyB0cmFqZWN0b3J5XG4gKiBjb25zdCB0cmFqZWN0b3J5ID0gbmV3IFRyYWplY3RvcnlCdWlsZGVyKClcbiAqICAgLnN0YXJ0U3RlcCgncXVlcnknLCAnV2hhdCBpcyBBST8nKVxuICogICAuZW5kU3RlcChyZXNwb25zZS50ZXh0LCByZXNwb25zZS5jb25maWRlbmNlKVxuICogICAuY29tcGxldGUoJ3N1Y2Nlc3MnKTtcbiAqXG4gKiBzb25hLnJlY29yZFRyYWplY3RvcnkodHJhamVjdG9yeSk7XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBGZWRlcmF0ZWQgTGVhcm5pbmdcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IEVwaGVtZXJhbEFnZW50LCBGZWRlcmF0ZWRDb29yZGluYXRvciB9IGZyb20gJ0BydXZlY3Rvci9ydXZsbG0nO1xuICpcbiAqIC8vIENlbnRyYWwgY29vcmRpbmF0b3JcbiAqIGNvbnN0IGNvb3JkaW5hdG9yID0gbmV3IEZlZGVyYXRlZENvb3JkaW5hdG9yKCdjb29yZC0xJyk7XG4gKlxuICogLy8gRXBoZW1lcmFsIGFnZW50cyBwcm9jZXNzIHRhc2tzIGFuZCBleHBvcnRcbiAqIGNvbnN0IGFnZW50ID0gbmV3IEVwaGVtZXJhbEFnZW50KCdhZ2VudC0xJyk7XG4gKiBhZ2VudC5wcm9jZXNzVGFzayhlbWJlZGRpbmcsIDAuOSk7XG4gKiBjb25zdCBleHBvcnREYXRhID0gYWdlbnQuZXhwb3J0U3RhdGUoKTtcbiAqXG4gKiAvLyBBZ2dyZWdhdGUgbGVhcm5pbmdcbiAqIGNvb3JkaW5hdG9yLmFnZ3JlZ2F0ZShleHBvcnREYXRhKTtcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIExvUkEgQWRhcHRlcnNcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IExvcmFBZGFwdGVyLCBMb3JhTWFuYWdlciB9IGZyb20gJ0BydXZlY3Rvci9ydXZsbG0nO1xuICpcbiAqIGNvbnN0IGFkYXB0ZXIgPSBuZXcgTG9yYUFkYXB0ZXIoeyByYW5rOiA4LCBhbHBoYTogMTYgfSk7XG4gKiBjb25zdCBvdXRwdXQgPSBhZGFwdGVyLmZvcndhcmQoaW5wdXQpO1xuICogYGBgXG4gKi9cblxuLy8gQ29yZSB0eXBlc1xuZXhwb3J0ICogZnJvbSAnLi90eXBlcyc7XG5cbi8vIE1haW4gZW5naW5lXG5leHBvcnQgKiBmcm9tICcuL2VuZ2luZSc7XG5cbi8vIFNJTUQgb3BlcmF0aW9uc1xuZXhwb3J0ICogZnJvbSAnLi9zaW1kJztcblxuLy8gU2Vzc2lvbiBtYW5hZ2VtZW50XG5leHBvcnQgKiBmcm9tICcuL3Nlc3Npb24nO1xuXG4vLyBTdHJlYW1pbmcgc3VwcG9ydFxuZXhwb3J0ICogZnJvbSAnLi9zdHJlYW1pbmcnO1xuXG4vLyBTT05BIGxlYXJuaW5nIHN5c3RlbVxuZXhwb3J0ICogZnJvbSAnLi9zb25hJztcblxuLy8gRmVkZXJhdGVkIGxlYXJuaW5nXG5leHBvcnQgKiBmcm9tICcuL2ZlZGVyYXRlZCc7XG5cbi8vIExvUkEgYWRhcHRlcnNcbmV4cG9ydCAqIGZyb20gJy4vbG9yYSc7XG5cbi8vIEV4cG9ydC9zZXJpYWxpemF0aW9uXG5leHBvcnQgKiBmcm9tICcuL2V4cG9ydCc7XG5cbi8vIFRyYWluaW5nIHBpcGVsaW5lXG5leHBvcnQgKiBmcm9tICcuL3RyYWluaW5nJztcblxuLy8gQ29udHJhc3RpdmUgZmluZS10dW5pbmdcbmV4cG9ydCAqIGZyb20gJy4vY29udHJhc3RpdmUnO1xuXG4vLyBNb2RlbCBkb3dubG9hZGVyIGFuZCByZWdpc3RyeVxuZXhwb3J0ICogZnJvbSAnLi9tb2RlbHMnO1xuXG4vLyBCZW5jaG1hcmtzIGZvciBDbGF1ZGUgQ29kZSB1c2UgY2FzZXNcbmV4cG9ydCAqIGZyb20gJy4vYmVuY2htYXJrcyc7XG5cbi8vIFJMTSAtIFJldHJpZXZhbCBMYW5ndWFnZSBNb2RlbFxuZXhwb3J0ICogZnJvbSAnLi9ybG0nO1xuXG4vLyBOYXRpdmUgYmluZGluZ3MgdXRpbGl0aWVzXG5leHBvcnQgeyB2ZXJzaW9uLCBoYXNTaW1kU3VwcG9ydCB9IGZyb20gJy4vbmF0aXZlJztcblxuLy8gRGVmYXVsdCBleHBvcnRcbmV4cG9ydCB7IFJ1dkxMTSBhcyBkZWZhdWx0IH0gZnJvbSAnLi9lbmdpbmUnO1xuIl19
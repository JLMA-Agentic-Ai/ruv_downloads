import { createMock } from './create-mock.js';
/**
 * Test application builder with full dependency injection
 *
 * @example
 * const app = createTestApplication()
 *   .withMockEventBus()
 *   .withMockTaskManager()
 *   .build();
 *
 * await app.services.taskManager.create(task);
 * expect(app.mocks.eventBus.publish).toHaveBeenCalled();
 */
export function createTestApplication() {
    return new TestApplicationBuilder();
}
/**
 * Builder class for constructing test applications
 */
class TestApplicationBuilder {
    eventBus = createMock();
    taskManager = createMock();
    agentLifecycle = createMock();
    memoryService = createMock();
    securityService = createMock();
    swarmCoordinator = createMock();
    /**
     * Configure mock event bus with default behavior
     */
    withMockEventBus(configure) {
        this.eventBus = createMock();
        this.eventBus.publish.mockResolvedValue(undefined);
        configure?.(this.eventBus);
        return this;
    }
    /**
     * Configure mock task manager with default behavior
     */
    withMockTaskManager(configure) {
        this.taskManager = createMock();
        this.taskManager.create.mockImplementation(async (def) => ({
            id: `task-${Date.now()}`,
            name: def.name,
            type: def.type,
            status: 'pending',
            payload: def.payload,
            createdAt: new Date(),
        }));
        this.taskManager.execute.mockResolvedValue({
            taskId: 'test-task',
            success: true,
            duration: 100,
        });
        configure?.(this.taskManager);
        return this;
    }
    /**
     * Configure mock agent lifecycle with default behavior
     */
    withMockAgentLifecycle(configure) {
        this.agentLifecycle = createMock();
        this.agentLifecycle.spawn.mockImplementation(async (config) => ({
            id: `agent-${Date.now()}`,
            type: config.type,
            name: config.name,
            status: 'idle',
        }));
        this.agentLifecycle.listAgents.mockResolvedValue([]);
        configure?.(this.agentLifecycle);
        return this;
    }
    /**
     * Configure mock memory service with default behavior
     */
    withMockMemoryService(configure) {
        this.memoryService = createMock();
        this.memoryService.store.mockResolvedValue(undefined);
        this.memoryService.retrieve.mockResolvedValue(null);
        this.memoryService.search.mockResolvedValue([]);
        configure?.(this.memoryService);
        return this;
    }
    /**
     * Configure mock security service with default behavior
     */
    withMockSecurityService(configure) {
        this.securityService = createMock();
        this.securityService.validatePath.mockReturnValue(true);
        this.securityService.hashPassword.mockResolvedValue('hashed');
        this.securityService.verifyPassword.mockResolvedValue(true);
        this.securityService.executeSecurely.mockResolvedValue({
            stdout: '',
            stderr: '',
            exitCode: 0,
        });
        configure?.(this.securityService);
        return this;
    }
    /**
     * Configure mock swarm coordinator with default behavior
     */
    withMockSwarmCoordinator(configure) {
        this.swarmCoordinator = createMock();
        this.swarmCoordinator.initialize.mockResolvedValue(undefined);
        this.swarmCoordinator.coordinate.mockResolvedValue({
            success: true,
            results: [],
            duration: 0,
        });
        this.swarmCoordinator.shutdown.mockResolvedValue(undefined);
        configure?.(this.swarmCoordinator);
        return this;
    }
    /**
     * Build the test application with all configured mocks
     */
    build() {
        return {
            services: {
                eventBus: this.eventBus,
                taskManager: this.taskManager,
                agentLifecycle: this.agentLifecycle,
                memoryService: this.memoryService,
                securityService: this.securityService,
                swarmCoordinator: this.swarmCoordinator,
            },
            mocks: {
                eventBus: this.eventBus,
                taskManager: this.taskManager,
                agentLifecycle: this.agentLifecycle,
                memoryService: this.memoryService,
                securityService: this.securityService,
                swarmCoordinator: this.swarmCoordinator,
            },
        };
    }
}
//# sourceMappingURL=test-application.js.map
import { SystemHealthCheckInput } from '../types/schemas.js';
export declare function systemHealthCheck(input: SystemHealthCheckInput): Promise<{
    overall_status: string;
    health_score: number;
    components: any;
    performance: any;
    recommendations: any[];
}>;
//# sourceMappingURL=system-health-check.d.ts.map
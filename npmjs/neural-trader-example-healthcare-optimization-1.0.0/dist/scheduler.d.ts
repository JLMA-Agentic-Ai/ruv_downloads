/**
 * Staff Scheduler
 *
 * Optimizes staff scheduling with skill constraints, shift preferences,
 * and fairness considerations using constraint programming.
 */
import type { StaffMember, ScheduleConstraints, ScheduleSolution, ForecastResult } from './types.js';
export interface SchedulerConfig {
    planningHorizonDays: number;
    shiftDuration: number;
    costPerConstraintViolation: number;
}
export declare class Scheduler {
    private config;
    private staff;
    constructor(config: SchedulerConfig);
    /**
     * Add staff member to pool
     */
    addStaff(member: StaffMember): void;
    /**
     * Generate optimal schedule based on forecasted demand
     */
    generateSchedule(forecasts: ForecastResult[], constraints: ScheduleConstraints, startDate: Date): Promise<ScheduleSolution>;
    /**
     * Calculate shift requirements from forecasts
     */
    private calculateShiftRequirements;
    /**
     * Assign staff to a specific shift
     */
    private assignStaffToShift;
    /**
     * Score staff member for shift assignment
     */
    private scoreStaffForShift;
    /**
     * Calculate total weekly hours for staff member
     */
    private calculateWeeklyHours;
    /**
     * Get last shift before reference date
     */
    private getLastShift;
    /**
     * Calculate consecutive hours worked
     */
    private calculateConsecutiveHours;
    /**
     * Get shift period (day/evening/night)
     */
    private getShiftPeriod;
    /**
     * Assign area based on role
     */
    private assignArea;
    /**
     * Group staff by role
     */
    private groupStaffByRole;
    /**
     * Calculate total cost of schedule
     */
    private calculateTotalCost;
    /**
     * Calculate coverage score (0-1)
     */
    private calculateCoverageScore;
    /**
     * Calculate fairness score (0-1)
     */
    private calculateFairnessScore;
    /**
     * Get staff list
     */
    getStaff(): StaffMember[];
}
//# sourceMappingURL=scheduler.d.ts.map
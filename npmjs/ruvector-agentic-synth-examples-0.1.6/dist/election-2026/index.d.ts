import { U as USState } from './simulator-DPlmy7Zb.js';
export { C as CampaignFactors, D as Demographics, a as EconomicIndicators, e as ElectionLearningMetrics, E as ElectionSimulator, H as HistoricalResults, M as ModelPerformance, N as NationalResults, b as PoliticalEnvironment, P as PollingData, h as ScenarioAnalysis, i as SensitivityAnalysis, f as SimulationConfig, g as SimulationProgress, c as SimulationResult, d as StateAggregateResults, S as StateElectionData, r as runElectionSimulation } from './simulator-DPlmy7Zb.js';

/**
 * US State data for 2026 Midterm Elections
 */

/**
 * All 50 US states with 2026 election information
 * Based on actual 2026 election calendar
 */
declare const US_STATES: USState[];
/**
 * Get states with Senate races in 2026
 */
declare function getSenateRaceStates(): USState[];
/**
 * Get states with Governor races in 2026
 */
declare function getGovernorRaceStates(): USState[];
/**
 * Get competitive states (battlegrounds) based on recent history
 */
declare function getCompetitiveStates(): USState[];
/**
 * Get state by abbreviation
 */
declare function getStateByAbbr(abbr: string): USState | undefined;
/**
 * Get states by region
 */
declare function getStatesByRegion(region: 'Northeast' | 'South' | 'Midwest' | 'West'): USState[];

export { USState, US_STATES, getCompetitiveStates, getGovernorRaceStates, getSenateRaceStates, getStateByAbbr, getStatesByRegion };

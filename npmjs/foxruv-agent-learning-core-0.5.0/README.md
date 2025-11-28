# @foxruv/agent-learning-core

Self-improving agent infrastructure used in production for:

- 🏈 **TheAnalyst** (NFL prediction engine)
- 🧬 **18-expert microbiome council** (clinical & research analysis)

It gives you a **two-phase learning loop**:

- **Training phase (Python + DSPy):**
  - Optimize prompts, few-shot examples, and signatures via MIPROv2
  - Evaluate on realistic datasets (time-aware splits, leak-free)
  - Persist optimized configs into AgentDB

- **Production phase (TypeScript only):**
  - Load the best-known config for each "expert"
  - Run via your LLM stack (@ax-llm/ax, local Qwen3, etc.)
  - No Python in the hot path

---

## Features

- 🧠 **Python optimizer client**
  - Type-safe client for a DSPy/MIPROv2 FastAPI service
- 🗃️ **AgentDB integration**
  - Store & load optimized prompts, signatures, and versions
- ☁️ **Supabase backend integration** ✨ NEW!
  - Centralized intelligence backend for all foxruv projects
  - Expert signature registry with version tracking
  - Vector-embedded reflexion bank (pgvector + HNSW)
  - Global telemetry and drift detection
  - Multi-expert consensus lineage
- ⚖️ **Time-aware dataset helpers**
  - Train/validation splits without temporal leakage
- 📈 **ReasoningBank learning**
  - Track trajectories, learn from past optimizations
- 🤖 **Swarm coordination**
  - Train multiple experts in parallel with load balancing
- ⚡ **Local LLM provider for batch inference**
  - Qwen3 HTTP provider with concurrency + batching

---

## Install

```bash
npm install @foxruv/agent-learning-core
# or
pnpm add @foxruv/agent-learning-core
```

---

## Quickstart

### 0. Connect to Supabase (NEW!)

Wire up the centralized intelligence backend:

```ts
import { initSupabaseFromEnv } from "@foxruv/agent-learning-core";

// Initialize once at startup
initSupabaseFromEnv();

// Now you can use all Supabase features:
// - storeExpertSignature()
// - logTelemetry()
// - saveReflexion()
// - recordConsensusLineage()
// - detectDrift()
```

**See [docs/SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md) for complete setup guide!**

### 1. Optimize an expert (training phase)

```ts
import {
  PythonOptimizerClient,
  AgentDBOptimizerStorage,
  createReasoningBank
} from "@foxruv/agent-learning-core";

const optimizer = new PythonOptimizerClient({
  baseUrl: process.env.DSPY_OPTIMIZER_URL!,
});

const storage = new AgentDBOptimizerStorage({
  agentdbPath: './data/optimizations.agentdb',
  autoInit: true
});

const reasoningBank = createReasoningBank('./data/reasoning.db');

const trainingData = await buildDomainTrainingData(); // your data

const result = await optimizer.optimize({
  expert_role: "my_domain_expert",
  signature: {
    inputs: [
      { name: "question", type: "string", description: "Question to answer" }
    ],
    outputs: [
      { name: "answer", type: "string", description: "Expert answer" }
    ]
  },
  training_data: trainingData,
});

await storage.storeOptimization(result);
await reasoningBank.storeOptimizationTrajectory("my_domain_expert", result);
```

### 2. Use the optimized expert in production (TS only)

```ts
import {
  AgentDBOptimizerStorage,
  Qwen3Provider,
} from "@foxruv/agent-learning-core";

const storage = new AgentDBOptimizerStorage({
  agentdbPath: './data/optimizations.agentdb',
  autoInit: true
});

const provider = new Qwen3Provider("http://localhost:1234", 5);

const expertConfig = await storage.loadOptimization("my_domain_expert");

// Use expertConfig.signature and expertConfig.few_shot_examples
// in your own expert class / @ax-llm/ax pipeline
const prediction = await provider.predict(
  expertConfig.signature,
  { question: "What is the capital of France?" }
);
```

### 3. Train multiple experts in parallel (swarm mode)

```ts
import {
  createSwarmCoordinator,
  PythonOptimizerClient,
  AgentDBOptimizerStorage,
  createReasoningBank
} from "@foxruv/agent-learning-core";

const optimizer = new PythonOptimizerClient({ baseUrl: "http://localhost:8000" });
const storage = new AgentDBOptimizerStorage({ autoInit: true });
const reasoningBank = createReasoningBank();

const coordinator = createSwarmCoordinator(optimizer, storage, {
  max_concurrent: 3,
  retry_on_failure: true,
  share_learning: true  // Experts learn from each other!
}, reasoningBank);

const results = await coordinator.trainExperts([
  {
    expert_role: "analyst",
    request: { /* ... */ },
    priority: "high"
  },
  {
    expert_role: "gambler",
    request: { /* ... */ },
    priority: "medium"
  },
  {
    expert_role: "scholar",
    request: { /* ... */ },
    priority: "high"
  }
]);

const stats = coordinator.getStats();
console.log(`Success rate: ${(stats.success_rate * 100).toFixed(1)}%`);
```

### 4. Time-aware dataset splitting (prevent data leakage)

```ts
import {
  DatasetBuilder,
  TemporalExample
} from "@foxruv/agent-learning-core";

const builder = new DatasetBuilder<TemporalExample>();

// Temporal split (train on past, validate on future)
const dataset = builder.buildTemporalSplit(examples, {
  strategy: 'temporal',
  trainThroughKey: 2023000,  // e.g., season * 1000 + week
  ensureNoLeakage: true
});

console.log(`Training: ${dataset.training.length} examples`);
console.log(`Validation: ${dataset.validation.length} examples`);
console.log(`Leakage detected: ${dataset.metadata.temporal_leakage_detected}`);
```

### 5. ReasoningBank: Learn from past optimizations

```ts
import { createReasoningBank } from "@foxruv/agent-learning-core";

const reasoningBank = createReasoningBank('./data/reasoning.db');

// Get learning insights
const insights = await reasoningBank.getInsights("analyst");
console.log(`Success rate: ${(insights.success_rate * 100).toFixed(1)}%`);
console.log(`Avg confidence: ${insights.avg_confidence.toFixed(2)}`);
console.log(`Total trajectories: ${insights.total_trajectories}`);

// Get patterns that led to success
const successPatterns = await reasoningBank.getSuccessPatterns("analyst");
console.log(`Avg improvement: ${(successPatterns.avg_improvement * 100).toFixed(1)}%`);
console.log(`Successful actions: ${successPatterns.successful_actions.join(', ')}`);
```

---

## Iris Prime Commands

Iris Prime provides AI operations monitoring and automatic optimization for your expert agents.

### Project Evaluation

**Single Project:**

```bash
# Evaluate project health with detailed report
npm run iris:evaluate -- --project nfl-predictor

# With JSON output for CI/CD
npm run iris:evaluate -- --project nfl-predictor --output-json report.json

# Enable auto-retrain on critical drift
npm run iris:evaluate -- --project nfl-predictor --auto-retrain
```

**All Projects:**

```bash
# Evaluate all configured projects
npm run iris:evaluate:all

# With verbose output
npm run iris:evaluate:all --verbose
```

**Batch Evaluation:**

```bash
# Process queue file (used by hooks)
npm run iris:evaluate-batch -- --queue .claude/iris-queue.jsonl

# Auto-clear queue on success
npm run iris:evaluate-batch -- --queue .claude/iris-queue.jsonl --clear-on-success
```

### Automatic Invocation

**Smart Auto-Invoke:**

```bash
# Check triggers and invoke if conditions met
npm run iris:auto-invoke -- --event file_edit --file src/models/expert.ts --project nfl-predictor

# Force invocation (skip trigger checks)
npm run iris:auto-invoke -- --event deployment --project nfl-predictor --force

# Dry-run mode (check triggers without invoking)
npm run iris:auto-invoke -- --event drift_detected --dry-run
```

### Maintenance & Operations

**Auto-Retrain:**

```bash
# Retrain drifting experts for a project
npm run iris:retrain -- --project nfl-predictor

# Retrain specific expert
npm run iris:retrain -- --project nfl-predictor --expert TheAnalyst
```

**Pattern Discovery:**

```bash
# Discover transferable patterns across projects
npm run iris:patterns

# Find patterns for specific project
npm run iris:patterns -- --source nfl-predictor --target microbiome-platform
```

**Health Check:**

```bash
# Quick health check for all projects
npm run iris:health

# Detailed health with recommendations
npm run iris:health --detailed
```

### Get Help

```bash
# View all available scripts
npm run

# Get help for specific command
npm run iris:evaluate -- --help
npm run iris:auto-invoke -- --help
```

### See Also

- [IRIS Prime Orchestration Guide](./docs/iris-prime-orchestration-fixes.md)
- [Auto-Invocation System](./docs/IRIS_AUTO_INVOCATION_COMPLETE.md)
- [Technical Architecture](./docs/TECHNICAL_GUIDE.md)

---

## Usage in Real Projects

- **NFL Predictor API**

  - Season-aware train/val splits (2022–2023 train, 2024 val)
  - Memory-aware NFL expert ("TheAnalyst")
  - Drift detection + auto-rollback when performance drops
  - Batch inference with local Qwen3 (5× throughput)
  - **Supabase integration**: Telemetry, consensus tracking, reflexion bank

- **Microbiome Platform**

  - Neo4j → DSPy → AgentDB pipeline for 18 experts
  - Clinical and research-grade evaluators
  - TypeScript-only production via @ax-llm/ax
  - Swarm training for parallel expert optimization
  - **Supabase integration**: Expert registry, multi-expert consensus

- **Cross-Project Intelligence**

  - Shared reflexion patterns across all foxruv projects
  - Global drift monitoring and alerts
  - Prompt evolution tracking and A/B testing
  - Cost and performance analytics dashboard

---

## Architecture

This package provides the **core infrastructure** that multiple domain-specific projects share:

```
@foxruv/agent-learning-core
├── clients/
│   ├── python-optimizer-client.ts    # HTTP client for DSPy MIPROv2
│   └── swarm-coordinator.ts          # Parallel expert training
├── storage/
│   ├── agentdb-optimizer-storage.ts  # AgentDB persistence
│   └── reasoning-bank.ts             # Trajectory learning
├── supabase/                         # ✨ NEW: Centralized backend
│   ├── client.ts                     # Supabase client setup
│   ├── signatures.ts                 # Expert signature registry
│   ├── telemetry.ts                  # Performance tracking
│   ├── reflexions.ts                 # Vector-based pattern bank
│   └── consensus.ts                  # Multi-expert decisions
├── providers/
│   ├── lm-provider.ts                # Multi-provider LLM abstraction
│   └── qwen3-provider.ts             # Qwen3/local model batch inference
├── training/
│   └── dataset-core.ts               # Time-aware splitting utilities
└── types/
    └── index.ts                      # Shared TypeScript types
```

**Domain-specific projects** (NFL, microbiome, etc.) import this core and add their own:

- Expert definitions
- Domain types
- Personality constraints
- Evaluation metrics
- Business logic

---

## API Reference

### Core Classes

#### `PythonOptimizerClient`

HTTP client for MIPROv2 optimization service.

```ts
const client = new PythonOptimizerClient({
  baseUrl: 'http://localhost:8000',
  timeout: 600000  // 10 minutes
});

await client.healthCheck();
const result = await client.optimize(request);
```

#### `AgentDBOptimizerStorage`

Persistent storage for optimized prompts.

```ts
const storage = new AgentDBOptimizerStorage({
  agentdbPath: './data/optimizations.agentdb',
  autoInit: true
});

await storage.storeOptimization(result);
const config = await storage.loadOptimization("expert_role");
const history = await storage.getOptimizationHistory("expert_role");
```

#### `ReasoningBankManager`

Trajectory-based learning system.

```ts
const reasoningBank = createReasoningBank('./data/reasoning.db');

await reasoningBank.storeTrajectory(trajectory);
const insights = await reasoningBank.getInsights("expert_role");
const patterns = await reasoningBank.analyzePatterns("expert_role");
```

#### `SwarmCoordinator`

Parallel expert training orchestrator.

```ts
const coordinator = createSwarmCoordinator(optimizer, storage, {
  max_concurrent: 3,
  retry_on_failure: true,
  share_learning: true
});

await coordinator.trainExperts(tasks);
const stats = coordinator.getStats();
```

#### `Qwen3Provider`

Batch inference with local models.

```ts
const provider = new Qwen3Provider('http://localhost:1234', 5);

const result = await provider.predict(signature, input);
const results = await provider.batchPredict(signature, inputs);
```

#### `DatasetBuilder`

Time-aware dataset splitting.

```ts
const builder = new DatasetBuilder();

const dataset = builder.buildTemporalSplit(examples, {
  strategy: 'temporal',
  trainThroughKey: cutoff,
  ensureNoLeakage: true
});
```

---

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Type check
npm run typecheck

# Clean
npm run clean
```

---

## Status

- ✅ Used in multiple real projects
- 🚧 API still evolving (0.x releases)
- 💡 Designed for people who want agents that learn over time instead of static prompts

---

## License

MIT

---

## Authors

**FoxRuv** - Building self-improving agent systems that get better with every prediction.

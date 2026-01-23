An algorithmic outline to implement a ReasoningBank-style system on top of your Claude Flow Memory Space. It maps cleanly to your SQLite-backed memory at `.swarm/memory.db` and the hooks system so you can drop this into flows immediately. Where I reference paper specifics or your repo’s schemas, I cite them.

---

## 0) What you will build

A closed-loop module with four algorithms wired into Claude Flow:

1. **Retrieve** relevant “principle” memories for a task and inject them into the system prompt.
2. **Judge** an interaction trajectory as Success or Failure.
3. **Distill** new strategy memories from both successes and failures.
4. **Consolidate** memories with deduplication, contradiction checks, scoring, and pruning.
5. **MaTTS Orchestrator** for parallel or sequential test-time scaling that converts extra rollouts into better memories.

ReasoningBank stores each memory item as `{title, description, content}` and retrieves top‑k via semantic similarity to inject as system instructions. It learns from both successes and failures and includes Memory‑aware Test‑Time Scaling (MaTTS) in parallel and sequential modes. ([arXiv][1])

Your Claude Flow Memory Space already exposes the right persistence primitives and tables, including `patterns` for learned behaviors, `events` for trajectories, and `performance_metrics`. The DB lives at `.swarm/memory.db`. ([GitHub][2])

---

## 1) Minimal schema extensions

Use your existing tables, add two small ones. Keep migrations idempotent.

```sql
-- A. Use existing patterns table to store ReasoningBank items
-- patterns(id TEXT PRIMARY KEY, type TEXT, pattern_data TEXT, confidence REAL, usage_count INT, created_at TEXT, last_used TEXT)
-- We will store type='reasoning_memory' and JSON in pattern_data

-- B. Embeddings for retrieval
CREATE TABLE IF NOT EXISTS pattern_embeddings (
  id TEXT PRIMARY KEY,           -- same id as patterns.id
  model TEXT NOT NULL,           -- e.g., text-embedding-3-large or Claude embed
  dims INTEGER NOT NULL,
  vector BLOB NOT NULL,          -- float32 array serialized
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- C. Links between memories for governance and consolidation
CREATE TABLE IF NOT EXISTS pattern_links (
  src_id TEXT NOT NULL,
  dst_id TEXT NOT NULL,
  relation TEXT NOT NULL,        -- 'entails' | 'contradicts' | 'refines' | 'duplicate_of'
  weight REAL DEFAULT 1.0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (src_id, dst_id, relation)
);

-- D. Task trajectory archive (optional if you already store in events)
CREATE TABLE IF NOT EXISTS task_trajectories (
  task_id TEXT PRIMARY KEY,
  agent_id TEXT,
  query TEXT NOT NULL,
  trajectory_json TEXT NOT NULL, -- steps, messages, tool calls
  started_at TEXT,
  ended_at TEXT,
  judge_label TEXT,              -- 'Success' | 'Failure'
  judge_conf REAL,               -- 0..1
  matts_run_id TEXT              -- to link with scaling bundles
);

-- E. MaTTS run bookkeeping
CREATE TABLE IF NOT EXISTS matts_runs (
  run_id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  mode TEXT NOT NULL,            -- 'parallel' | 'sequential'
  k INTEGER NOT NULL,
  status TEXT DEFAULT 'completed',
  summary TEXT,                  -- JSON with outcomes
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

Your `events`, `tasks`, `performance_metrics`, and `memory_store` tables remain as is. ([GitHub][2])

---

## 2) Data model for a memory item

```json
{
  "id": "rm_ulid_01HZX…",
  "type": "reasoning_memory",
  "pattern_data": {
    "title": "Handle login flows with CSRF tokens",
    "description": "Always fetch and include CSRF token before POST.",
    "content": "1) Load login page and parse CSRF from form or meta tag. 2) Attach token to POST. 3) Retry once if 403 and refresh token.",
    "source": {
      "task_id": "task_…",
      "agent_id": "agent_web",
      "outcome": "Success",
      "evidence": ["event_id_192", "event_id_205"]
    },
    "tags": ["web", "auth", "csrf"],
    "domain": "webarena.admin",
    "created_at": "2025-10-10T12:00:00Z",
    "confidence": 0.76,
    "n_uses": 0
  }
}
```

This mirrors the ReasoningBank schema of `{title, description, content}`. ([arXiv][1])

---

## 3) Retrieval algorithm

**Inputs:** `task_query`, optional `domain`, `k`
**Outputs:** ordered list of memory items with scores

**Steps**

1. **Embed query**

   * Compute embedding `q` with your chosen model. Persist in a short‑lived cache.

2. **Candidate fetch**

   * SQL: select all `patterns` where `type='reasoning_memory'`. Join to `pattern_embeddings` for vectors.
   * Optional prefilter by `domain` or tags.

3. **Score** each candidate `i` with a bounded additive model:

   ```
   sim_i   = cosine(q, e_i)
   rec_i   = exp(-age_days_i / H)           -- H half-life in days, default 45
   rel_i   = clamp(confidence_i, 0, 1)      -- from judge agreement and reuse
   div_i   = MMR penalty against already selected set S
   score_i = α*sim_i + β*rec_i + γ*rel_i - δ*div_i
   defaults: α=0.65, β=0.15, γ=0.20, δ=0.10
   ```

   Use Maximal Marginal Relevance for `div_i` to avoid near duplicates.

4. **Select** top‑k with MMR:

   ```
   S = {}
   while |S| < k:
     pick argmax_i [ score_i - δ*max_{j in S} cosine(e_i, e_j) ]
     add i to S
   ```

5. **Record usage**

   * Increment `usage_count` and update `last_used` in `patterns`.
   * Log to `performance_metrics` the retrieval latency and selected IDs.

6. **Inject** into agent system prompt as a short preamble:

   * Each item as bullet with `title` then compact `content`.
   * Paper injects items into system instruction for the agent. Keep k small. ([arXiv][1])

---

## 4) Judge algorithm

Binary classification of a finished trajectory.

**Inputs:** `task_query`, `trajectory_json`
**Outputs:** `label ∈ {Success, Failure}`, `confidence ∈ [0,1]`

**Prompt template**
LLM-as-judge with deterministic decoding.

```
System: You are a strict evaluator for task completion.
User: 
Task: "<task_query>"
Trajectory: <structured JSON of steps, tool calls, outputs>

Evaluate if the final state meets the acceptance criteria.
Respond with pure JSON:
{"label": "Success" | "Failure", "confidence": 0..1, "reasons": ["..."]}
```

ReasoningBank uses an LLM-as-judge to label outcomes without ground truth. Set temperature to 0 for determinism. ([arXiv][1])

**Post‑processing**

* Persist into `task_trajectories` and `events`.
* Update rolling confusion audits by spot‑checking 5 percent with a rules verifier if available.

---

## 5) Distillation algorithms

Create memories from both successes and failures.

### 5.1 Distill from Success

**Inputs:** `task_query`, `trajectory_json`, `label='Success'`
**Outputs:** up to `m` memory items

**Prompt template**

```
System: Extract reusable strategy principles as concise, general rules.
User:
Given a task and its successful trajectory, produce up to {{m}} memory items.
Each item must be a JSON object with keys: title, description (1 sentence), content (3-8 numbered steps with clear decision criteria).
Avoid copying low-level URLs, IDs, PII, or task-specific constants.

Task: "<task_query>"
Trajectory: <JSON>

Respond with:
{"memories":[{...},{...}]}
```

Paper extracts multiple items per trajectory with title, description, content. ([arXiv][1])

### 5.2 Distill from Failure

**Inputs:** same, but `label='Failure'`
**Outputs:** up to `m` guardrails

**Prompt template**

```
System: Extract failure guardrails as preventative rules.
User:
From the failed trajectory, create up to {{m}} guardrail items.
Each item schema is the same, but content should specify failure modes, checks, and recovery steps to avoid repetition.
```

ReasoningBank explicitly uses failures to create counterfactual signals and pitfalls. ([arXiv][1])

### 5.3 Upsert

For each item:

1. Compute `id = ulid()`.
2. Compute embedding and insert into `pattern_embeddings`.
3. Insert into `patterns` with:

   * `type='reasoning_memory'`
   * `pattern_data` JSON with the schema above
   * `confidence = judge_conf * prior` where `prior=0.7` for successes and `0.6` for failures
4. Emit `events` row `type='reasoning_memory.created'`.

---

## 6) Consolidation and governance

Run after every N new items or on a schedule.

### 6.1 Deduplicate

* Cluster by cosine similarity threshold `t_dup=0.87`.
* Within each cluster, keep the highest `score_i` from the retrieval model and link others via `pattern_links(relation='duplicate_of', weight=similarity)`.

### 6.2 Contradiction check

* Pairwise NLI on candidate conflicts. If contradiction probability above `t_contra=0.6`, add `pattern_links(relation='contradicts')`.
* If a new item contradicts many frequently used items, reduce its `confidence` or quarantine it for review.

### 6.3 Aging and pruning

* Exponential decay with half‑life `H=90` days for confidence.
* Hard delete if `usage_count=0` and `confidence<0.3` and `age>180days`.
* Always redact identifiers and secrets before store. Route through a PII filter.

### 6.4 Audit trail

* Log consolidation actions into `events` and `performance_metrics` for transparency.

The paper keeps consolidation minimal to highlight core contributions, but notes advanced consolidation like merging and forgetting can be added, which is what you are doing here. ([arXiv][1])

---

## 7) MaTTS Orchestrator

Convert extra inference compute into better memories.

Two modes per ReasoningBank: parallel and sequential. ([arXiv][1])

### 7.1 Parallel MaTTS

**Inputs:** `task_query`, scaling factor `k`
**Pipeline**

1. Retrieve current top‑k′ memories and inject into each rollout.
2. Launch `k` independent rollouts with controlled diversity seeds.
3. Judge each rollout.
4. **Self‑contrast aggregation:** prompt the model to compare trajectories, identify common successful patterns and common failure pitfalls, then extract a small set of higher‑quality memories.

Aggregation prompt:

```
System: You are aggregating insights across multiple attempts of the same task.
User:
We have {{k}} trajectories with their labels. Compare and contrast them.
1) Identify patterns present in most successful attempts but absent in failures.
2) Identify pitfalls present in failures but not in successes.
3) Produce 1-3 distilled memory items that generalize beyond this task.

Respond as:
{"memories":[{title,description,content},...], "notes":["..."]}
```

5. Upsert memories and record `matts_runs` with `mode='parallel'`.

### 7.2 Sequential MaTTS

**Inputs:** `task_query`, refinement steps `r`
**Pipeline**

1. Run an initial trajectory.
2. Iteratively re‑check and refine the same trajectory `r` times with a “check and correct” instruction.
3. Use all intermediate notes as signals for memory extraction.
4. Upsert and record `mode='sequential'`.

MaTTS is defined as memory‑aware scaling that exploits contrastive signals among multiple trajectories or iterative refinements, improving transferability of memories. ([arXiv][1])

---

## 8) Claude Flow wiring

Leverage your hooks and memory system. Your repo exposes a hooks system with `post-task` and `post-command`, and documents the SQLite memory location. ([GitHub][3])

### 8.1 Hook configuration

Add these to `.claude/settings.json`:

```json
{
  "hooks": {
    "preTaskHook": {
      "command": "npx",
      "args": ["claude-flow", "hooks", "pre-task", "--retrieve-reasoningbank", "true"],
      "alwaysRun": true
    },
    "postTaskHook": {
      "command": "npx",
      "args": ["claude-flow", "hooks", "post-task", "--judge-and-distill", "true"],
      "alwaysRun": true
    }
  }
}
```

### 8.2 Hook handlers (TypeScript pseudocode)

```ts
// pre-task: retrieve
export async function preTask({ taskId, agentId, query }) {
  const memories = await retrieveMemories(query, { k: 3 });  // section 3
  await injectSystemPreamble(agentId, memories);             // adds to system prompt
  await metrics.log('retrieve_ms', /*duration*/);
}

// post-task: judge + distill + consolidate
export async function postTask({ taskId, agentId, query, trajectory }) {
  const verdict = await judge(query, trajectory);            // section 4
  await db.exec("UPDATE task_trajectories SET judge_label=?, judge_conf=? WHERE task_id=?",
                [verdict.label, verdict.confidence, taskId]);
  const newItems = await distill(query, trajectory, verdict);// section 5
  for (const item of newItems) await upsertMemory(item);
  await maybeConsolidate();                                   // section 6
}
```

### 8.3 MaTTS orchestrator entry points

```ts
export async function mattsParallel({ taskId, query, k=6 }) {
  const runs = await Promise.all(Array.from({length: k}, () => runOnce(query)));
  const judgments = await Promise.all(runs.map(r => judge(query, r.trajectory)));
  const agg = await aggregateContrastive(runs, judgments);    // new memories
  await upsertMemories(agg.memories);
  await db.exec("INSERT INTO matts_runs(run_id, task_id, mode, k, summary) VALUES (?,?,?,?,?)",
                [ulid(), taskId, 'parallel', k, JSON.stringify(summary(runs, judgments))]);
}

export async function mattsSequential({ taskId, query, r=3 }) {
  let tr = await runOnce(query);
  for (let i=0; i<r; i++) tr = await refineOnce(query, tr);
  const j = await judge(query, tr.trajectory);
  const mems = await distill(query, tr.trajectory, j);
  await upsertMemories(mems);
  await db.exec("INSERT INTO matts_runs(run_id, task_id, mode, k, summary) VALUES (?,?,?,?,?)",
                [ulid(), taskId, 'sequential', r, JSON.stringify({ final:j })]);
}
```

---

## 9) System prompt injection format

Keep it short and structured.

```
System preamble: Strategy memories you can optionally use.

1) [Title] Handle login flows with CSRF tokens
   Steps: Load page and parse CSRF. Attach token to POST. Retry once if 403 and refresh token.

2) [Title] Avoid infinite pagination loops
   Steps: Detect repeated DOM states and stop. Summarize partial results.
```

The paper injects retrieved items into system instruction. Keep k small to avoid noise. ([arXiv][1])

---

## 10) Scoring, confidence, and learning rates

* **Initial confidence**
  `Success` item: 0.7 to 0.85 depending on judge confidence.
  `Failure` guardrail: 0.6 to 0.75.
* **Update rule after each use**
  `confidence ← clamp(confidence + η*(success_delta), 0, 1)` with `η=0.05`, where `success_delta=+1` if task success and item was cited by the agent, else `-0.5` if failure with item cited.
* **Usage-based boost**
  `rel_i = sigmoid( log(1 + usage_count) )`.

---

## 11) Evaluation harness

Track these in `performance_metrics` and export CSV weekly:

* Success rate, steps to success, cost per success, time‑to‑resolution.
* Memory yield: new items per 100 tasks, active items used per task.
* MaTTS lift: compare baseline vs k in parallel and r in sequential.

ReasoningBank reports improvements in both effectiveness and efficiency on WebArena and SWE‑Bench‑Verified, and finds small top‑k retrieval is beneficial. Use those patterns when selecting k and MaTTS scales. ([arXiv][1])

---

## 12) Security and compliance

* PII scrubber before `upsertMemory`.
* Tenant scoping in `patterns` via a `tenant_id` column if you operate multi‑tenant.
* `pattern_links` helps quarantine contradicting or risky memories before promotion.

Anthropic’s recent updates on memory for projects and enterprise emphasize scoped project memories and privacy controls, which align with tenant and project boundaries here. ([Anthropic][4])

---

## 13) Configuration template

```yaml
reasoningbank:
  retrieve:
    k: 3
    alpha: 0.65
    beta: 0.15
    gamma: 0.20
    delta: 0.10
    recency_half_life_days: 45
    duplicate_threshold: 0.87
  judge:
    model: "claude-sonnet-4.5"
    temperature: 0
  distill:
    max_items_per_traj: 3
    redact_pii: true
  consolidate:
    run_every_new_items: 20
    contradiction_threshold: 0.60
    prune_age_days: 180
    min_confidence_keep: 0.30
  matts:
    enabled: true
    parallel_k: 6
    sequential_r: 3
```

---

## 14) End‑to‑end pseudocode

```ts
export async function runTask(taskId: string, query: string) {
  // Retrieve and inject memories
  const mems = await retrieveMemories(query, { k: cfg.retrieve.k });
  await injectSystemPreamble('agent_main', mems);

  // Execute agent loop
  const trajectory = await runAgentLoop(query); // your existing ReAct/tool loop

  // Persist trajectory
  await db.exec("INSERT OR REPLACE INTO task_trajectories(task_id, query, trajectory_json, started_at, ended_at) VALUES (?,?,?,?,?)", ...);

  // Judge
  const verdict = await judge(query, trajectory);

  // Distill
  const newItems = await distill(query, trajectory, verdict);

  // Upsert new memories
  for (const mi of newItems) await upsertMemory(mi);

  // Consolidate if threshold reached
  if (await newItemCountSinceLastConsolidation() >= cfg.consolidate.run_every_new_items) {
    await consolidate();
  }

  return { verdict, usedMemories: mems.map(m => m.id), newItems: newItems.map(m => m.id) };
}
```

---

## 15) Bench switches you can flip without code changes

* `k` for retrieval and `parallel_k` or `sequential_r` for MaTTS.
* Embedding model choice.
* Dedup threshold and contradiction threshold.
* Confidence update rate `η`.

---

## 16) Where this aligns with the paper and your stack

* Memory item schema with `title`, `description`, `content` and injection into system prompt at inference. ([arXiv][1])
* Learn from both successful and failed trajectories using an LLM‑as‑judge. ([arXiv][1])
* MaTTS in parallel and sequential modes to turn extra compute into better memory. ([arXiv][1])
* Storage and orchestration sit naturally on your Claude Flow Memory System and hooks at `.swarm/memory.db`. ([GitHub][2])

---

## 17) Quick validation plan

1. Shadow deploy on a WebArena‑like subset or a client workflow with measurable acceptance criteria.
2. A/B: baseline vs ReasoningBank vs ReasoningBank+MaTTS(k=6).
3. Gate to prod when cost per success reduces by at least 15 percent at equal or better SR.

---

[1]: https://arxiv.org/html/2509.25140v1 "ReasoningBank: Scaling Agent Self-Evolving with Reasoning Memory"
[2]: https://github.com/ruvnet/claude-flow/wiki/Memory-System "Memory System · ruvnet/claude-flow Wiki · GitHub"
[3]: https://github.com/ruvnet/claude-flow "GitHub - ruvnet/claude-flow:  The leading agent orchestration platform for Claude. Deploy intelligent multi-agent swarms, coordinate autonomous workflows, and build conversational AI systems. Features    enterprise-grade architecture, distributed swarm intelligence, RAG integration, and native Claude Code support via MCP protocol. Ranked #1 in agent-based frameworks."
[4]: https://www.anthropic.com/news/memory?utm_source=chatgpt.com "Claude introduces memory for teams at work"

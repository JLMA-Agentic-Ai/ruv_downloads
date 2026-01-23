# RuVector WebAssembly Competitive Intelligence + Business Simulation Tutorial (rVite)

I’ve put together a new tutorial for RV Lite and RuVector that reflects how I actually work. Prediction by itself is noise. Knowing what might happen is useless if you cannot adapt, respond, and steer toward the outcome you want.

This system is about doing all three. It does not stop at forecasting a future state. It models pressure, uncertainty, and momentum, then plots a viable course forward and keeps adjusting that course as reality pushes back. Signals change, competitors move, assumptions break. The system notices, recalibrates, and guides the next step.

What makes this different is where and how it runs. RV Lite and RuVector operate directly in the browser using WebAssembly. That means fast feedback, privacy by default, and continuous learning without shipping your strategy to a server. Attention mechanisms surface what matters now. Graph and GNN structures capture how competitors influence each other. Simulations turn insight into prescriptive action.

This tutorial shows exactly how I do it. Not just predicting the future, but shaping it.

## What you are building

A fully in-browser, offline-capable competitive intelligence system that:

1. Ingests public signals (press releases, pricing pages, job posts, patents, earnings call notes, GitHub activity, partner announcements).
2. Lets you label and triage signals in a Signal Inbox.
3. Generates competitor move predictions with evidence and timeline ranges.
4. Tracks prediction accuracy with backtesting (Brier score).
5. Runs business simulations that turn predictions into action recommendations.
6. Adds GNN-based “pressure scores” for competitor clusters.
7. Uses attention-style weighting of signals to improve precision and explainability.

This tutorial uses RuVector in WebAssembly so the core intelligence store runs client-side for privacy, speed, and offline operation. RuVector WASM is designed for browser deployment and highlights benefits like offline IndexedDB persistence and Web Workers support. ([Docs.rs][1])

---

## Why RuVector WASM for this use case

### Business benefits (plain English)

* **Fast retrieval for “what looks like this”**: vector similarity makes “find the closest historical analogs” practical at interactive speed. ([Docs.rs][2])
* **Privacy-first workflows**: signals, annotations, and strategy notes can stay in the browser with no server round-trips. ([Docs.rs][1])
* **Offline-first**: your analysts can keep working even without network access (travel, client sites). IndexedDB persistence is built in. ([Docs.rs][2])
* **Auditable predictions**: you can attach evidence, keep calibration honest via Brier score, and show what drove the prediction.

### Technical benefits

RuVector WASM includes:

* **VectorDB API** (insert, search, delete, batch operations) and optional HNSW indexing. ([Docs.rs][2])
* **Multiple distance metrics** (cosine, euclidean, dotproduct, manhattan). ([Docs.rs][2])
* **Web Workers support** and persistence. ([Docs.rs][1])

---

# Tutorial roadmap (sections + callouts)

1. Project scaffold (rVite + WASM readiness)
2. Data model and storage strategy
3. 128D embedder + versioning
4. Signal Inbox with labeling
5. Prediction page with evidence and timelines
6. Backtesting page with Brier score
7. Simulation runner with action recommendations
8. GNN pressure scores for competitor clusters
9. Attention-based signal weighting to improve precision
10. Operating cadence and future-state guidance

Each section includes:

* **What it does**
* **Why it matters**
* **Implementation callouts** (gotchas, shortcuts, upgrade path)

---

## 1) rVite scaffold and WASM setup

### What it does

Creates a React + Vite app and installs RuVector WASM modules.

### Why it matters

You want the intelligence store to run locally in the browser, and you want repeatable builds.

### Steps

```bash
npm create vite@latest ci-wasm-intel -- --template react-ts
cd ci-wasm-intel
npm install
```

Install RuVector WASM packages:

```bash
npm install @ruvector/wasm
npm install @ruvector/graph-wasm
```

RuVector WASM docs show the basic import pattern and init sequence. ([Docs.rs][1])
Graph WASM exposes a GraphDB class with Cypher-style querying and node/edge APIs. ([Docs.rs][3])

Optional (for the GNN section):

* If available in your environment, add the GNN WASM package:

  * `npm install @ruvector/gnn-wasm` (package index indicates it exists). ([Libraries.io][4])
* If your npm environment does not have it, compile from Rust using wasm-pack (MDN shows the standard Rust-to-WASM workflow). ([MDN Web Docs][5])

#### Vite + WASM plugin (recommended safety net)

Vite does not support the WebAssembly ESM integration proposal directly; when you hit WASM import friction, the common fix is a Vite WASM plugin. ([vitejs][6])

```bash
npm install -D vite-plugin-wasm
```

Create `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";

// Optional: only needed if you turn on true WASM threading features later.
// Some thread pools require cross-origin isolation headers.
const enableCOIHeaders = false;

export default defineConfig({
  plugins: [react(), wasm()],
  server: enableCOIHeaders
    ? {
        headers: {
          "Cross-Origin-Opener-Policy": "same-origin",
          "Cross-Origin-Embedder-Policy": "require-corp",
        },
      }
    : undefined,
});
```

**Callout: Multithreading reality**
If you later enable real WASM threading (SharedArrayBuffer + worker pools), you may need cross-origin isolation policies. That is a known requirement for web concurrency patterns like wasm-bindgen-rayon. ([Docs.rs][7])

---

## 2) Data model for business-grade CI

### What it does

Defines the objects that flow through the system and the minimum metadata required to simulate future states.

### Why it matters

Without a clean model, your “predictions” become notes, not measurable forecasts.

Create `src/intel/types.ts`:

```ts
export type SignalSource =
  | "press"
  | "pricing"
  | "jobs"
  | "patent"
  | "github"
  | "partners"
  | "earnings"
  | "other";

export type SignalLabel =
  | "Pricing"
  | "Product"
  | "Market"
  | "Claims"
  | "Technology"
  | "Partnership"
  | "Hiring"
  | "Regulatory"
  | "Risk";

export type Signal = {
  id: string;
  competitorId: string;
  source: SignalSource;
  url: string;
  ts: number; // unix ms
  title: string;
  text: string;
  labels: SignalLabel[];
  embedderVersion: string;
};

export type PredictionCategory =
  | "Pricing"
  | "Product"
  | "Market"
  | "Claims"
  | "Technology";

export type Prediction = {
  id: string;
  competitorId: string;
  category: PredictionCategory;
  predictedMove: string;
  probability: number; // 0..1
  horizonDays: { min: number; max: number };
  createdAt: number;
  rationale: string;

  // Evidence includes an explicit "why" plus optional attention weight.
  evidence: Array<{
    signalId: string;
    url: string;
    why: string;
    weight?: number;
  }>;

  // Later filled in by backtesting
  resolvedAt?: number;
  outcome?: 0 | 1;

  embedderVersion: string;
};

export type ActionRecommendation = {
  actionId: string;
  actionName: string;
  expectedValue: number;
  downsideP10: number; // 10th percentile
  explanation: string;
};
```

**Callout: “Evidence + timeline + calibration” is the core contract**
If you enforce those three fields, the system stays honest.

---

## 3) 128D embedder + versioning (fast and deterministic)

### What it does

Creates a lightweight, deterministic 128-dimensional embedder you can run fully client-side.

### Why it matters

* 128 dimensions is fast and cheap for search and simulation loops.
* Determinism makes backtesting fair (same text always maps to the same vector).
* Versioning prevents silent model drift.

RuVector VectorDB requires a fixed dimension at creation time. ([Docs.rs][2])

Create `src/intel/embedder128.ts`:

```ts
const DIM = 128 as const;

// Bump this when you change tokenization, hashing, weighting, etc.
export const EMBEDDER_VERSION = "hash128-v1";

// Simple tokenization
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

// FNV-1a 32-bit hash
function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function l2Normalize(v: Float32Array): Float32Array {
  let sum = 0;
  for (let i = 0; i < v.length; i++) sum += v[i] * v[i];
  const norm = Math.sqrt(sum) || 1;
  for (let i = 0; i < v.length; i++) v[i] /= norm;
  return v;
}

/**
 * Fast 128D text embedder using feature hashing.
 * Works well as a baseline, and is cheap enough for heavy simulations.
 */
export function embed128(text: string): Float32Array {
  const v = new Float32Array(DIM);
  const tokens = tokenize(text);

  for (const tok of tokens) {
    const h = fnv1a(tok);
    const idx = h % DIM;

    // Signed hashing to reduce collisions
    const sign = (h & 1) === 0 ? 1 : -1;

    // Light TF shaping: repeated tokens matter, but not linearly
    v[idx] += sign * 1.0;
  }

  return l2Normalize(v);
}
```

Create `src/intel/embedderVersioning.ts`:

```ts
import { EMBEDDER_VERSION } from "./embedder128";

export function currentEmbedderVersion(): string {
  return EMBEDDER_VERSION;
}

export function needsReembed(storedVersion: string): boolean {
  return storedVersion !== EMBEDDER_VERSION;
}
```

**Callout: Upgrade path**
If you later adopt a stronger embedder (local MiniLM via ONNX, or an API embedder), keep the output at 128D using projection. The rule stays: store `embedderVersion` on every object and never mix versions in backtests.

---

## 4) RuVector WASM initialization (VectorDB + GraphDB)

### What it does

Bootstraps:

* A vector store for semantic similarity.
* A graph store for relationships and evidence trails.

### Why it matters

Vectors answer “similar to what.”
Graphs answer “connected to what, and why.”

Create `src/intel/ruvector.ts`:

```ts
import initVec, { VectorDB } from "@ruvector/wasm";
import initGraph, { GraphDB } from "@ruvector/graph-wasm";

export const VECTOR_DIM = 128;
const VEC_DB_NAME = "ci_signals_vecdb_v1";
const GRAPH_STORAGE_KEY = "ci_graph_cypher_v1";

let _vec: VectorDB | null = null;
let _graph: GraphDB | null = null;

export async function getVectorDB(): Promise<VectorDB> {
  if (_vec) return _vec;

  await initVec(); // one-time wasm init
  // VectorDB constructor: (dimensions, metric, use_hnsw) :contentReference[oaicite:14]{index=14}
  try {
    const loaded = await (VectorDB as any).load_from_indexed_db(VEC_DB_NAME);
    _vec = loaded as VectorDB;
    return _vec;
  } catch {
    _vec = new VectorDB(VECTOR_DIM, "cosine", true);
    return _vec;
  }
}

export async function persistVectorDB(): Promise<void> {
  const db = await getVectorDB();
  // save_to_indexed_db returns a Promise :contentReference[oaicite:15]{index=15}
  await db.save_to_indexed_db();
}

export async function getGraphDB(): Promise<GraphDB> {
  if (_graph) return _graph;

  await initGraph();
  _graph = new GraphDB("cosine");

  // Restore graph from saved Cypher
  const cypher = localStorage.getItem(GRAPH_STORAGE_KEY);
  if (cypher && cypher.trim().length > 0) {
    const statements = cypher
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    // import_cypher is async :contentReference[oaicite:16]{index=16}
    await _graph.import_cypher(statements);
  }

  return _graph;
}

export async function persistGraphDB(): Promise<void> {
  const g = await getGraphDB();
  // export_cypher returns a string :contentReference[oaicite:17]{index=17}
  const cypher = g.export_cypher();
  localStorage.setItem(GRAPH_STORAGE_KEY, cypher);
}
```

**Callout: Persistence strategy**

* VectorDB persists directly to IndexedDB. ([Docs.rs][2])
* GraphDB exports and imports Cypher statements. ([Docs.rs][3])
  That gives you offline durability without building a backend.

---

## 5) Signal Inbox with labeling

### What it does

A page where you:

* Add signals (manual paste is fine for v1).
* Label them consistently.
* Store them in VectorDB (for similarity) and GraphDB (for evidence trails).

### Why it matters

Prediction quality is usually determined upstream by signal hygiene.

### Storage rules

* **Vectors** store semantic access.
* **Graph edges** store business meaning.

Create `src/intel/signalRepo.ts`:

```ts
import { embed128 } from "./embedder128";
import { currentEmbedderVersion } from "./embedderVersioning";
import { getGraphDB, getVectorDB, persistGraphDB, persistVectorDB } from "./ruvector";
import type { Signal, SignalLabel } from "./types";

const SIGNAL_IDS_KEY = "ci_signal_ids_v1";

function loadIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SIGNAL_IDS_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveIds(ids: string[]) {
  localStorage.setItem(SIGNAL_IDS_KEY, JSON.stringify(ids));
}

export async function listSignals(): Promise<Signal[]> {
  const db = await getVectorDB();
  const ids = loadIds();

  const out: Signal[] = [];
  for (const id of ids) {
    const entry = await db.get(id);
    if (!entry) continue;
    const meta = entry.metadata as Signal;
    out.push(meta);
  }

  // newest first
  out.sort((a, b) => b.ts - a.ts);
  return out;
}

export async function addSignal(input: Omit<Signal, "embedderVersion">): Promise<void> {
  const db = await getVectorDB();
  const graph = await getGraphDB();

  const embedderVersion = currentEmbedderVersion();
  const signal: Signal = { ...input, embedderVersion };

  const v = embed128(`${signal.title}\n${signal.text}`);

  // Insert vector with metadata. VectorDB.insert(vector, id?, metadata?) :contentReference[oaicite:20]{index=20}
  db.insert(v, signal.id, signal);

  // Graph nodes + edges
  // GraphDB.create_node(labels, properties) :contentReference[oaicite:21]{index=21}
  const competitorNodeId = graph.create_node(["Competitor"], {
    competitorId: signal.competitorId,
  });
  const signalNodeId = graph.create_node(["Signal"], {
    signalId: signal.id,
    competitorId: signal.competitorId,
    ts: signal.ts,
    source: signal.source,
    url: signal.url,
  });

  // competitor -[EMITTED]-> signal
  graph.create_edge(competitorNodeId, signalNodeId, "EMITTED", { ts: signal.ts });

  // signal -[LABELED_AS]-> label nodes
  for (const label of signal.labels) {
    const labelNodeId = graph.create_node(["Label"], { label });
    graph.create_edge(signalNodeId, labelNodeId, "LABELED_AS", {});
  }

  const ids = loadIds();
  if (!ids.includes(signal.id)) {
    ids.unshift(signal.id);
    saveIds(ids.slice(0, 5000));
  }

  await persistVectorDB();
  await persistGraphDB();
}

export async function updateSignalLabels(signalId: string, labels: SignalLabel[]): Promise<void> {
  const db = await getVectorDB();
  const entry = await db.get(signalId);
  if (!entry) return;

  const signal = entry.metadata as Signal;
  const updated: Signal = { ...signal, labels };

  // Replace: delete then insert updated metadata
  db.delete(signalId);
  const v = embed128(`${updated.title}\n${updated.text}`);
  db.insert(v, updated.id, updated);

  await persistVectorDB();
}
```

### Signal Inbox page UI

Create `src/pages/SignalsPage.tsx`:

```tsx
import { useEffect, useState } from "react";
import type { Signal, SignalLabel } from "../intel/types";
import { addSignal, listSignals, updateSignalLabels } from "../intel/signalRepo";

const ALL_LABELS: SignalLabel[] = [
  "Pricing","Product","Market","Claims","Technology","Partnership","Hiring","Regulatory","Risk"
];

function uid(prefix = "sig"): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export function SignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [competitorId, setCompetitorId] = useState("competitor_a");
  const [source, setSource] = useState<Signal["source"]>("press");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  async function refresh() {
    setSignals(await listSignals());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onAdd() {
    await addSignal({
      id: uid(),
      competitorId,
      source,
      url,
      ts: Date.now(),
      title,
      text,
      labels: [],
    });
    setUrl("");
    setTitle("");
    setText("");
    await refresh();
  }

  async function toggleLabel(signal: Signal, label: SignalLabel) {
    const has = signal.labels.includes(label);
    const next = has ? signal.labels.filter(l => l !== label) : [...signal.labels, label];
    await updateSignalLabels(signal.id, next);
    await refresh();
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Signal Inbox</h2>
      <p>Add public signals, label them, then generate predictions.</p>

      <div style={{ display: "grid", gap: 8, maxWidth: 800 }}>
        <label>
          Competitor ID
          <input value={competitorId} onChange={e => setCompetitorId(e.target.value)} style={{ width: "100%" }} />
        </label>
        <label>
          Source
          <select value={source} onChange={e => setSource(e.target.value as any)} style={{ width: "100%" }}>
            <option value="press">press</option>
            <option value="pricing">pricing</option>
            <option value="jobs">jobs</option>
            <option value="patent">patent</option>
            <option value="github">github</option>
            <option value="partners">partners</option>
            <option value="earnings">earnings</option>
            <option value="other">other</option>
          </select>
        </label>
        <label>
          URL
          <input value={url} onChange={e => setUrl(e.target.value)} style={{ width: "100%" }} />
        </label>
        <label>
          Title
          <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: "100%" }} />
        </label>
        <label>
          Text
          <textarea value={text} onChange={e => setText(e.target.value)} rows={5} style={{ width: "100%" }} />
        </label>

        <button onClick={onAdd}>Add Signal</button>
      </div>

      <hr />

      {signals.map(s => (
        <div key={s.id} style={{ border: "1px solid #333", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            {new Date(s.ts).toLocaleString()} | {s.competitorId} | {s.source}
          </div>
          <div style={{ fontWeight: 700 }}>{s.title}</div>
          <div style={{ fontSize: 12 }}>
            <a href={s.url} target="_blank" rel="noreferrer">{s.url}</a>
          </div>
          <p style={{ whiteSpace: "pre-wrap" }}>{s.text}</p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ALL_LABELS.map(l => (
              <button
                key={l}
                onClick={() => toggleLabel(s, l)}
                style={{
                  padding: "4px 8px",
                  borderRadius: 999,
                  border: "1px solid #444",
                  opacity: s.labels.includes(l) ? 1 : 0.5,
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Callout: Labeling discipline pays off later**
Your GNN cluster pressure and attention weighting both get better when labels are consistent and not overloaded.

---

## 6) Prediction page with evidence and timelines

### What it does

Generates predictions per competitor:

* Category
* Confidence (probability)
* Timeline (min-max days)
* Evidence list

### Why it matters

This is where “signals” become “decisions.”

### Attention-weighted precursor signals (your explainability engine)

We will:

1. Embed each recent signal.
2. Compute an attention-style weight per signal.
3. Use top-weighted signals as evidence.

Create `src/intel/attention.ts`:

```ts
function dot(a: Float32Array, b: Float32Array): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function softmax(xs: number[], temperature = 1): number[] {
  const t = Math.max(1e-6, temperature);
  const m = Math.max(...xs);
  const exps = xs.map(x => Math.exp((x - m) / t));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map(e => e / sum);
}

/**
 * Single-head attention weights between a "query" vector and a set of signal vectors.
 * This is enough to produce precursor signals + better aggregation.
 */
export function attentionWeights(query: Float32Array, keys: Float32Array[]): number[] {
  const d = query.length;
  const scores = keys.map(k => dot(query, k) / Math.sqrt(d));
  return softmax(scores, 0.7);
}
```

Create `src/intel/predictor.ts`:

```ts
import { embed128 } from "./embedder128";
import { currentEmbedderVersion } from "./embedderVersioning";
import { attentionWeights } from "./attention";
import type { Prediction, PredictionCategory, Signal } from "./types";
import { listSignals } from "./signalRepo";
import { getVectorDB, persistVectorDB } from "./ruvector";

const PRED_IDS_KEY = "ci_prediction_ids_v1";

function loadPredIds(): string[] {
  try { return JSON.parse(localStorage.getItem(PRED_IDS_KEY) || "[]"); } catch { return []; }
}
function savePredIds(ids: string[]) {
  localStorage.setItem(PRED_IDS_KEY, JSON.stringify(ids));
}

function uid(prefix = "pred"): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

// Simple business timeline heuristics by category
function horizonFor(category: PredictionCategory): { min: number; max: number } {
  switch (category) {
    case "Pricing": return { min: 3, max: 21 };
    case "Claims": return { min: 7, max: 30 };
    case "Market": return { min: 14, max: 60 };
    case "Technology": return { min: 21, max: 90 };
    case "Product": return { min: 14, max: 120 };
  }
}

function clamp01(x: number) {
  return Math.max(0.01, Math.min(0.99, x));
}

type Rule = {
  category: PredictionCategory;
  move: string;
  baseP: number;
  when: (signals: Signal[]) => boolean;
};

const RULES: Rule[] = [
  {
    category: "Pricing",
    move: "price_change",
    baseP: 0.55,
    when: (s) => s.some(x => x.source === "pricing" || x.labels.includes("Pricing")),
  },
  {
    category: "Market",
    move: "enterprise_push",
    baseP: 0.50,
    when: (s) => s.some(x => x.labels.includes("Hiring") && /enterprise|sales|account executive/i.test(x.text)),
  },
  {
    category: "Technology",
    move: "tech_acceleration",
    baseP: 0.48,
    when: (s) => s.some(x => x.labels.includes("Technology") || /model|ai|platform|infrastructure/i.test(x.text)),
  },
  {
    category: "Product",
    move: "new_feature_or_sku",
    baseP: 0.45,
    when: (s) => s.some(x => x.labels.includes("Product")),
  },
];

export async function generatePredictionsForCompetitor(competitorId: string): Promise<Prediction[]> {
  const all = await listSignals();
  const recent = all.filter(s => s.competitorId === competitorId).slice(0, 30);

  // If no signals, no predictions
  if (recent.length === 0) return [];

  // Build a "situation query" vector from recent text
  const situationText = recent.map(s => `${s.title}\n${s.text}`).join("\n\n");
  const situationVec = embed128(situationText);

  // Pull analogs from vector DB (pattern-based component)
  const db = await getVectorDB();
  const analogs = db.search(situationVec, 12); // VectorDB.search(query, k, filter?) :contentReference[oaicite:22]{index=22}

  // Attention weights for precursor signals
  const signalVecs = recent.map(s => embed128(`${s.title}\n${s.text}`));
  const weights = attentionWeights(situationVec, signalVecs);

  const topEvidence = recent
    .map((s, i) => ({ s, w: weights[i] }))
    .sort((a, b) => b.w - a.w)
    .slice(0, 6);

  // Rule proposals
  const proposals = RULES.filter(r => r.when(recent)).map(r => {
    // crude analog boost based on how many analog matches exist
    const analogBoost = Math.min(0.15, analogs.length * 0.01);
    return {
      category: r.category,
      move: r.move,
      p: clamp01(r.baseP + analogBoost),
      rationale: `Rule match + analog boost. Top analog IDs: ${analogs.slice(0, 3).map(a => a.id).join(", ")}`,
    };
  });

  // Persist predictions as vectors too (optional, but useful for later retrieval)
  const embedderVersion = currentEmbedderVersion();
  const ids = loadPredIds();

  const predictions: Prediction[] = proposals.map(p => {
    const id = uid();
    return {
      id,
      competitorId,
      category: p.category,
      predictedMove: p.move,
      probability: p.p,
      horizonDays: horizonFor(p.category),
      createdAt: Date.now(),
      rationale: p.rationale,
      evidence: topEvidence.map(e => ({
        signalId: e.s.id,
        url: e.s.url,
        why: `High precursor weight from recent context`,
        weight: Number(e.w.toFixed(4)),
      })),
      embedderVersion,
    };
  });

  for (const pred of predictions) {
    const v = embed128(
      `${pred.category}\n${pred.predictedMove}\n${pred.rationale}\n` +
      pred.evidence.map(e => e.signalId).join(",")
    );
    db.insert(v, pred.id, pred); // store prediction metadata
    ids.unshift(pred.id);
  }

  savePredIds(ids.slice(0, 2000));
  await persistVectorDB();

  return predictions;
}

export async function listPredictions(): Promise<Prediction[]> {
  const db = await getVectorDB();
  const ids = loadPredIds();

  const out: Prediction[] = [];
  for (const id of ids) {
    const entry = await db.get(id);
    if (!entry) continue;
    const meta = entry.metadata as Prediction;
    out.push(meta);
  }
  out.sort((a, b) => b.createdAt - a.createdAt);
  return out;
}
```

**Callout: This is “pattern-based predictions” without a big model**
Vectors retrieve analogs. Rules keep it auditable. Attention weights make precursor signals visible.

### Predictions page UI

Create `src/pages/PredictionsPage.tsx`:

```tsx
import { useEffect, useState } from "react";
import type { Prediction } from "../intel/types";
import { generatePredictionsForCompetitor, listPredictions } from "../intel/predictor";

export function PredictionsPage() {
  const [preds, setPreds] = useState<Prediction[]>([]);
  const [competitorId, setCompetitorId] = useState("competitor_a");

  async function refresh() {
    setPreds(await listPredictions());
  }

  useEffect(() => { refresh(); }, []);

  async function onGenerate() {
    await generatePredictionsForCompetitor(competitorId);
    await refresh();
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Predictions</h2>
      <p>Evidence-backed predictions with probability and timeline ranges.</p>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input value={competitorId} onChange={e => setCompetitorId(e.target.value)} />
        <button onClick={onGenerate}>Generate Predictions</button>
      </div>

      <hr />

      {preds.map(p => (
        <div key={p.id} style={{ border: "1px solid #333", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 800 }}>
                {p.competitorId} | {p.category} | {p.predictedMove}
              </div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                Created: {new Date(p.createdAt).toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>
                {(p.probability * 100).toFixed(0)}%
              </div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                Timeline: {p.horizonDays.min}-{p.horizonDays.max} days
              </div>
            </div>
          </div>

          <p style={{ marginTop: 8 }}>{p.rationale}</p>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 700 }}>Evidence</div>
            <ul>
              {p.evidence.map((e, i) => (
                <li key={`${p.id}_${i}`}>
                  <a href={e.url} target="_blank" rel="noreferrer">{e.signalId}</a>
                  {" "} - {e.why}
                  {typeof e.weight === "number" ? ` (weight ${e.weight})` : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 7) Backtesting page with Brier score

### What it does

Lets you mark predictions as resolved (0/1 outcome) and computes calibration metrics.

### Why it matters

Backtesting prevents “confidence inflation.” Brier score is a proper scoring rule for probabilistic forecasts and punishes overconfidence.

### Implementation

Create `src/intel/backtest.ts`:

```ts
import type { Prediction } from "./types";

export function brierScore(predictions: Prediction[]): number {
  const resolved = predictions.filter(p => typeof p.outcome === "number");
  if (resolved.length === 0) return NaN;

  let sum = 0;
  for (const p of resolved) {
    const y = p.outcome as number; // 0 or 1
    const err = p.probability - y;
    sum += err * err;
  }
  return sum / resolved.length;
}

export function calibrationBuckets(predictions: Prediction[], bucketSize = 0.1) {
  const resolved = predictions.filter(p => typeof p.outcome === "number");
  const buckets: Array<{ lo: number; hi: number; n: number; avgP: number; hitRate: number }> = [];

  for (let lo = 0; lo < 1; lo += bucketSize) {
    const hi = lo + bucketSize;
    const b = resolved.filter(p => p.probability >= lo && p.probability < hi);
    if (b.length === 0) continue;

    const avgP = b.reduce((s, p) => s + p.probability, 0) / b.length;
    const hitRate = b.reduce((s, p) => s + (p.outcome || 0), 0) / b.length;

    buckets.push({ lo, hi, n: b.length, avgP, hitRate });
  }

  return buckets;
}
```

Add resolution updates to predictions:

Create `src/intel/predictionRepo.ts`:

```ts
import { getVectorDB, persistVectorDB } from "./ruvector";
import type { Prediction } from "./types";
import { listPredictions } from "./predictor";

export async function setPredictionOutcome(predictionId: string, outcome: 0 | 1) {
  const db = await getVectorDB();
  const entry = await db.get(predictionId);
  if (!entry) return;

  const p = entry.metadata as Prediction;
  const updated: Prediction = { ...p, outcome, resolvedAt: Date.now() };

  // Replace
  db.delete(predictionId);
  // Re-embed optional. Keep it simple: reuse same embedder pipeline by embedding its text again if you want.
  // For tutorial we store metadata and ignore the vector for changed outcome.
  db.insert(entry.vector as any, updated.id, updated);

  await persistVectorDB();
}

export async function getPredictionsWithOutcomes(): Promise<Prediction[]> {
  return listPredictions();
}
```

Backtesting page UI:

Create `src/pages/BacktestingPage.tsx`:

```tsx
import { useEffect, useState } from "react";
import type { Prediction } from "../intel/types";
import { getPredictionsWithOutcomes, setPredictionOutcome } from "../intel/predictionRepo";
import { brierScore, calibrationBuckets } from "../intel/backtest";

export function BacktestingPage() {
  const [preds, setPreds] = useState<Prediction[]>([]);

  async function refresh() {
    setPreds(await getPredictionsWithOutcomes());
  }

  useEffect(() => { refresh(); }, []);

  const score = brierScore(preds);
  const buckets = calibrationBuckets(preds);

  return (
    <div style={{ padding: 16 }}>
      <h2>Backtesting</h2>
      <p>Mark outcomes and track calibration with Brier score.</p>

      <div style={{ border: "1px solid #333", padding: 12, borderRadius: 8 }}>
        <div style={{ fontWeight: 800 }}>
          Brier score: {Number.isFinite(score) ? score.toFixed(4) : "No resolved predictions yet"}
        </div>

        <div style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 700 }}>Calibration buckets</div>
          <ul>
            {buckets.map((b) => (
              <li key={`${b.lo}-${b.hi}`}>
                {(b.lo * 100).toFixed(0)}-{(b.hi * 100).toFixed(0)}%:
                {" "}n={b.n}, avgP={b.avgP.toFixed(2)}, hitRate={b.hitRate.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <hr />

      {preds.map(p => (
        <div key={p.id} style={{ border: "1px solid #333", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <div style={{ fontWeight: 800 }}>
            {p.competitorId} | {p.category} | {p.predictedMove} | {(p.probability * 100).toFixed(0)}%
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={async () => { await setPredictionOutcome(p.id, 1); await refresh(); }}>
              Mark True (1)
            </button>
            <button onClick={async () => { await setPredictionOutcome(p.id, 0); await refresh(); }}>
              Mark False (0)
            </button>
            <div style={{ opacity: 0.8 }}>
              Outcome: {typeof p.outcome === "number" ? p.outcome : "unresolved"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Callout: Calibration rule**
If your Brier score is not improving over time, do not add more model complexity. Fix labeling, evidence quality, and resolution discipline first.

---

## 8) Simulation runner with action recommendations

### What it does

Runs Monte Carlo simulations over predicted competitor moves to recommend actions.

### Why it matters

Predictions without a decision loop do not move the business.

### Minimal simulation approach (practical and extendable)

* A prediction is an event with probability and time window.
* An action modifies payoff and risk exposure.
* The simulator samples futures and scores actions.

Create `src/intel/simulate.ts`:

```ts
import type { ActionRecommendation, Prediction } from "./types";

type Action = {
  id: string;
  name: string;
  // cost in arbitrary units
  cost: number;
  // effect multipliers
  defendPricing: number;   // reduces damage from competitor price cuts
  productVelocity: number; // reduces damage from competitor product moves
  demandGen: number;       // offsets market/claims pressure
};

const ACTIONS: Action[] = [
  { id: "hold", name: "Hold course", cost: 0, defendPricing: 1.0, productVelocity: 1.0, demandGen: 1.0 },
  { id: "price_match", name: "Selective price matching", cost: 15, defendPricing: 1.6, productVelocity: 1.0, demandGen: 1.0 },
  { id: "ship_fast", name: "Accelerate product delivery", cost: 20, defendPricing: 1.0, productVelocity: 1.7, demandGen: 1.0 },
  { id: "market_push", name: "Targeted market + claims response", cost: 12, defendPricing: 1.0, productVelocity: 1.0, demandGen: 1.5 },
];

function rand(): number {
  return Math.random();
}

function sampleBernoulli(p: number): 0 | 1 {
  return rand() < p ? 1 : 0;
}

// Simple payoff model: higher is better
function scoreWorld(preds: Prediction[], action: Action): number {
  // baseline profit score
  let score = 100;

  for (const p of preds) {
    const happens = sampleBernoulli(p.probability);
    if (!happens) continue;

    // damage by category
    if (p.category === "Pricing") score -= 18 / action.defendPricing;
    if (p.category === "Product") score -= 14 / action.productVelocity;
    if (p.category === "Technology") score -= 10 / action.productVelocity;
    if (p.category === "Market") score -= 12 / action.demandGen;
    if (p.category === "Claims") score -= 8 / action.demandGen;
  }

  score -= action.cost;
  return score;
}

function percentile(xs: number[], p: number): number {
  if (xs.length === 0) return NaN;
  const sorted = [...xs].sort((a, b) => a - b);
  const idx = Math.floor(p * (sorted.length - 1));
  return sorted[idx];
}

export function recommendActions(predictions: Prediction[], runs = 2000): ActionRecommendation[] {
  const recs: ActionRecommendation[] = [];

  for (const action of ACTIONS) {
    const scores: number[] = [];
    for (let i = 0; i < runs; i++) {
      scores.push(scoreWorld(predictions, action));
    }

    const expectedValue = scores.reduce((a, b) => a + b, 0) / scores.length;
    const downsideP10 = percentile(scores, 0.1);

    recs.push({
      actionId: action.id,
      actionName: action.name,
      expectedValue,
      downsideP10,
      explanation:
        `Optimizes expected outcome while managing downside. ` +
        `Cost=${action.cost}, defendPricing=${action.defendPricing}, productVelocity=${action.productVelocity}, demandGen=${action.demandGen}`,
    });
  }

  // Sort by expected value, break ties by downside risk
  recs.sort((a, b) => (b.expectedValue - a.expectedValue) || (b.downsideP10 - a.downsideP10));
  return recs;
}
```

Simulation page UI:

Create `src/pages/SimulationPage.tsx`:

```tsx
import { useEffect, useState } from "react";
import type { Prediction } from "../intel/types";
import { listPredictions } from "../intel/predictor";
import { recommendActions } from "../intel/simulate";

export function SimulationPage() {
  const [preds, setPreds] = useState<Prediction[]>([]);
  const [runs, setRuns] = useState(2000);

  useEffect(() => {
    listPredictions().then(setPreds);
  }, []);

  const recs = recommendActions(preds.slice(0, 25), runs);

  return (
    <div style={{ padding: 16 }}>
      <h2>Simulation Runner</h2>
      <p>Monte Carlo simulations that turn predictions into action recommendations.</p>

      <label>
        Runs
        <input
          type="number"
          value={runs}
          onChange={(e) => setRuns(Number(e.target.value))}
          style={{ marginLeft: 8 }}
        />
      </label>

      <hr />

      {recs.map(r => (
        <div key={r.actionId} style={{ border: "1px solid #333", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <div style={{ fontWeight: 800 }}>{r.actionName}</div>
          <div>Expected value: {r.expectedValue.toFixed(2)}</div>
          <div>Downside P10: {r.downsideP10.toFixed(2)}</div>
          <p style={{ opacity: 0.85 }}>{r.explanation}</p>
        </div>
      ))}
    </div>
  );
}
```

**Callout: Simulation maturity model**

* v1: simple payoff model (above)
* v2: include time windows, delayed impacts, budget constraints
* v3: include competitor clusters and contagion via GNN pressure
* v4: tie to real business KPIs (CAC, retention, margin, pipeline velocity)

---

## 9) Add GNN pressure scores for competitor clusters

### What it does

Computes a “pressure score” that represents how much a competitor’s neighborhood is heating up.

### Why it matters

Competitors do not act independently. Moves cluster and propagate.

### What we will do

1. Create competitor state embeddings (aggregate of recent signals).
2. Build neighbor sets (similar competitors).
3. Run a GNN forward pass to get an updated competitor representation.
4. Turn that into a scalar “pressure score”.

RuVector’s GNN WASM layer provides a `JsRuvectorLayer` with `new(...)` and `forward(...)`. ([Docs.rs][8])

Create `src/intel/gnnPressure.ts`:

```ts
import { embed128 } from "./embedder128";
import type { Prediction, Signal } from "./types";

// If you install @ruvector/gnn-wasm, the import typically mirrors @ruvector/wasm style.
import initGNN, { JsRuvectorLayer } from "@ruvector/gnn-wasm";

// Cosine similarity helper
function cosine(a: Float32Array, b: Float32Array): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function l2(v: Float32Array): number {
  let s = 0;
  for (let i = 0; i < v.length; i++) s += v[i] * v[i];
  return Math.sqrt(s);
}

export async function computeCompetitorPressure(args: {
  competitorIds: string[];
  signals: Signal[];
  predictions: Prediction[];
}): Promise<Record<string, number>> {
  const { competitorIds, signals, predictions } = args;

  await initGNN();

  // 1) competitor embedding = average of recent signals (simple baseline)
  const compVec: Record<string, Float32Array> = {};
  for (const c of competitorIds) {
    const recent = signals.filter(s => s.competitorId === c).slice(0, 20);
    if (recent.length === 0) {
      compVec[c] = embed128(`competitor:${c}`);
      continue;
    }
    const v = embed128(recent.map(r => `${r.title}\n${r.text}`).join("\n\n"));
    compVec[c] = v;
  }

  // 2) Build neighbors by similarity
  const neighbors: Record<string, Array<{ id: string; w: number }>> = {};
  for (const c of competitorIds) {
    const sims = competitorIds
      .filter(x => x !== c)
      .map(x => ({ id: x, w: Math.max(0, cosine(compVec[c], compVec[x])) }))
      .sort((a, b) => b.w - a.w)
      .slice(0, 6); // top neighbors
    neighbors[c] = sims;
  }

  // 3) GNN layer: input_dim=128, hidden_dim=64, heads=4, dropout=0.1 :contentReference[oaicite:24]{index=24}
  const layer = new JsRuvectorLayer(128, 64, 4, 0.1);

  // 4) Forward pass per competitor node
  const pressure: Record<string, number> = {};
  for (const c of competitorIds) {
    const node = Array.from(compVec[c]); // Vec<f32>
    const neigh = neighbors[c];
    const neighEmbeddings = neigh.map(n => Array.from(compVec[n.id])); // array of Vec<f32>
    const edgeWeights = neigh.map(n => n.w); // Vec<f32>

    // forward(node_embedding, neighbor_embeddings, edge_weights) :contentReference[oaicite:25]{index=25}
    const updated = layer.forward(node, neighEmbeddings as any, edgeWeights);

    // pressure score: magnitude of update times neighborhood prediction activity
    const updatedVec = new Float32Array(updated);
    const delta = Math.max(0, l2(updatedVec) - l2(compVec[c]));

    // neighborhood "heat": sum of neighbor probabilities
    const neighHeat = neigh.reduce((s, n) => {
      const p = predictions
        .filter(pr => pr.competitorId === n.id)
        .slice(0, 5)
        .reduce((a, pr) => a + pr.probability, 0);
      return s + p * n.w;
    }, 0);

    pressure[c] = Number((delta * (1 + neighHeat)).toFixed(4));
  }

  return pressure;
}
```

**Callout: Pressure score is not a prediction**
It is a contextual modifier you can use to adjust probabilities and simulation outcomes.

---

## 10) Add attention-based signal weighting to improve precision

### What it does

Improves:

* Evidence quality (precursor signals)
* Aggregation quality (situation vector)
* Calibration (less noisy features)

### Why it matters

Many CI systems fail because they average signals equally. They are not equal.

You already added a simple attention weighting function. That is enough for v1.

#### Upgrade path: use RuVector attention mechanisms

RuVector’s attention crate includes scaled dot-product, multi-head attention, graph attention, geometric attention, and sparse patterns. ([Docs.rs][9])
The WASM bindings list multiple attention implementations (Flash, MultiHead, Linear, MoE, etc.). ([Docs.rs][10])

**Callout: Practical rollout**

* Keep your current single-head weighting as your baseline.
* Only migrate to multi-head attention once your backtesting loop is stable (resolutions are consistent and Brier score is meaningful).

---

# Wiring routes (app navigation)

Create `src/App.tsx`:

```tsx
import { Link, Route, Routes } from "react-router-dom";
import { SignalsPage } from "./pages/SignalsPage";
import { PredictionsPage } from "./pages/PredictionsPage";
import { BacktestingPage } from "./pages/BacktestingPage";
import { SimulationPage } from "./pages/SimulationPage";

export function App() {
  return (
    <div>
      <nav style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #333" }}>
        <Link to="/signals">Signals</Link>
        <Link to="/predictions">Predictions</Link>
        <Link to="/backtesting">Backtesting</Link>
        <Link to="/simulation">Simulation</Link>
      </nav>

      <Routes>
        <Route path="/signals" element={<SignalsPage />} />
        <Route path="/predictions" element={<PredictionsPage />} />
        <Route path="/backtesting" element={<BacktestingPage />} />
        <Route path="/simulation" element={<SimulationPage />} />
        <Route path="*" element={<SignalsPage />} />
      </Routes>
    </div>
  );
}
```

Create `src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

Run:

```bash
npm run dev
```

---

# Ongoing guidance and future-state implementation

## Operating cadence (keeps the system honest)

### Weekly (analyst workflow)

* Triage new signals
* Apply consistent labels
* Generate predictions
* Add evidence notes for anything high-confidence

### Monthly (model integrity)

* Resolve older predictions
* Review Brier score and calibration buckets
* Identify overconfident categories and adjust rules, timelines, or thresholds

### Quarterly (strategy and simulation)

* Run scenario simulations for major competitors
* Compare recommended actions vs what leadership actually did
* Update payoff model to reflect reality (pricing elasticity, product adoption lag)

**Callout: Calibration beats cleverness**
A boring, calibrated predictor + simulation loop is worth more than a clever predictor nobody trusts.

---

## Future-state roadmap (practical)

### Future state A: Better embeddings without breaking backtests

* Keep the 128D contract.
* Add `hash128-v2` or `minilm-proj128-v1`.
* Store both in parallel for a while, compare Brier and calibration.

### Future state B: Better evidence and explainability

* Add “evidence strength” rubric:

  * Source reliability
  * Recency
  * Directness (pricing page change beats a rumor)
* Encode those as weights in attention and in simulation payoffs.

### Future state C: More realistic simulations

* Add time delays (move impact starts at day X)
* Add budget constraints and decision portfolios
* Add “contagion” effects using GNN pressure

### Future state D: Optional all-in-one local DB mode (RvLite)

RvLite is described as a lightweight standalone vector database running entirely in WebAssembly with SQL, SPARQL, and Cypher interfaces. ([Lib.rs][11])
Use it if you want one embedded engine that speaks multiple query styles for your analysts.

---

# Quick section checklist (so you can track completion)

1. 128D embedder + versioning: done
2. Signal inbox with labeling: done
3. Prediction page with evidence + timelines: done
4. Backtesting page with Brier score: done
5. Simulation runner with action recommendations: done
6. GNN pressure scores for competitor clusters: implemented baseline
7. Attention-based signal weighting: implemented baseline + upgrade path

---

If you want, paste your current file tree (or the key folders) and I will align the code above to your exact naming conventions and add the two missing “business-grade” features that usually matter next:

* Prediction alerts (threshold + time window + label filters)
* Threat vs opportunity classification tied to your simulation payoff model

[1]: https://docs.rs/crate/ruvector-wasm/latest "https://docs.rs/crate/ruvector-wasm/latest"
[2]: https://docs.rs/ruvector-wasm/latest/ruvector_wasm/struct.VectorDB.html "VectorDB in ruvector_wasm - Rust"
[3]: https://docs.rs/ruvector-graph-wasm/latest/ruvector_graph_wasm/struct.GraphDB.html "https://docs.rs/ruvector-graph-wasm/latest/ruvector_graph_wasm/struct.GraphDB.html"
[4]: https://libraries.io/npm/%40ruvector%2Fgnn-wasm "https://libraries.io/npm/%40ruvector%2Fgnn-wasm"
[5]: https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Rust_to_Wasm "https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Rust_to_Wasm"
[6]: https://vite.dev/guide/features "Features | Vite"
[7]: https://docs.rs/wasm-bindgen-rayon "https://docs.rs/wasm-bindgen-rayon"
[8]: https://docs.rs/ruvector-gnn-wasm/latest/ruvector_gnn_wasm/struct.JsRuvectorLayer.html "https://docs.rs/ruvector-gnn-wasm/latest/ruvector_gnn_wasm/struct.JsRuvectorLayer.html"
[9]: https://docs.rs/ruvector-attention "https://docs.rs/ruvector-attention"
[10]: https://docs.rs/ruvector-attention-wasm/latest/ruvector_attention_wasm/all.html "https://docs.rs/ruvector-attention-wasm/latest/ruvector_attention_wasm/all.html"
[11]: https://lib.rs/crates/rvlite "https://lib.rs/crates/rvlite"

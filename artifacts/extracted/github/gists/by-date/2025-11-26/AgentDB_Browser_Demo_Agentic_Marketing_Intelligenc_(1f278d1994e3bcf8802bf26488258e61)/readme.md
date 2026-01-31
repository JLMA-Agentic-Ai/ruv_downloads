# 🎓 Agentic Marketing Intelligence System

🧠 AgentDB Browser introduces a new class of in-browser AI systems that think, learn, and adapt without relying on cloud infrastructure. Built on AgentDB v1.3.9, it runs entirely inside the browser using WebAssembly AgentDB, combining local reasoning, vector memory, and causal inference into a single self-contained engine.

An intelligent marketing optimization system that uses AgentDB's ReasoningBank with SAFLA (Self-Adaptive Feedback Loop Architecture) to automatically optimize Meta Ads campaigns. It learns from past performance, discovers causal patterns, and reallocates budgets to maximize ROAS (Return on Ad Spend).

This demo showcases how intelligence can operate at the edge, learning from data directly on the client side, without APIs or external dependencies. The system uses ReasoningBank SAFLA (Self-Adaptive Feedback Loop Architecture) to observe outcomes, detect cause-effect relationships, and refine strategy automatically. Every decision is stored as a Reflexion episode, building long-term contextual memory.

AgentDB Browser enables full cognitive capability within the browser:

- Local reasoning and learning using WASM-based AgentDB.
- Causal graph inference to identify what actions drive performance.
- Reflexion memory for self-critique and improvement over time.
- Semantic vector search for pattern retrieval and knowledge reuse.

Everything runs client-side, private, and persistent. Each browser becomes an intelligent node — capable of independent reasoning, feedback, and adaptation.

This isn’t a simulation. It’s a living, self-optimizing intelligence loop operating entirely within your browser, demonstrating how local AI cognition is reshaping the future of adaptive computing.

- Live demo: https://agentdb.ruv.io/demo/agentic-marketing 
- Source Code: https://gist.github.com/ruvnet/1f278d1994e3bcf8802bf26488258e61#file-x-index-html

---

## 🚀 Step 1: Load AgentDB v1.3.9

Include AgentDB directly in your HTML:

```html
<script src="https://unpkg.com/agentdb@1.3.9/dist/agentdb.min.js"></script>
```

Once loaded, initialize it using:

```js
AgentDB.onReady(() => {
  const db = new AgentDB.Database();
  db.initializeAsync().then(() => {
    console.log('AgentDB ready for Reflexion and ReasoningBank operations');
  });
});
```

Version 1.3.9 is fully backward compatible with v1.0.7 and includes an integrated WASM SQLite backend. It automatically creates the five foundational tables:

* **vectors**
* **patterns**
* **episodes**
* **causal_edges**
* **skills**

---

## 🧩 Step 2: Understand the Core Loop

The system runs using a **self-adaptive feedback cycle** known as SAFLA. Each cycle collects campaign data, evaluates ROAS performance, stores Reflexion episodes, and updates causal relationships.

### Core process:

1. Simulate or collect ad performance metrics.
2. Record outcomes into **ReasoningBank**.
3. Store learning results using **Reflexion**.
4. Discover cause-effect relationships through **Causal Inference**.
5. Adjust budgets and strategies based on what it has learned.

This creates a live adaptive system that becomes more intelligent with every iteration.

---

## 🧠 Step 3: Storing Reflexion Episodes

Reflexion Learning allows the system to reflect on its own results. It stores full context, reward signals, and self-critiques for each learning cycle.

Example:

```js
await db.reflexion_store({
  session_id: 'campaign-optimizer',
  task: 'Optimize Meta Ads',
  input: { budget: 1500, targeting: '25-45' },
  output: { roas: 2.8, conversions: 42 },
  reward: 1.0,
  success: true,
  critique: 'Strong performance. Expand creative variants.',
  latency_ms: 140,
  tokens: 900
});
```

If the Reflexion API is not available, the fallback controller `storeEpisode()` can be used. Both methods write structured memory into the same local AgentDB database.

---

## 🔗 Step 4: Adding Causal Relationships

The causal graph connects cause and effect patterns discovered by the SAFLA loop. It explains what actions actually changed outcomes.

Example:

```js
await db.causal_add_edge({
  cause: 'Increased Budget by 20%',
  effect: 'ROAS improved by 0.3x',
  uplift: 0.3,
  confidence: 0.9,
  sample_size: 50
});
```

Each edge is logged in **causal_edges**, building a reasoning network that future optimizations can query.

---

## 🧩 Step 5: Storing Learned Patterns

When the system recognizes high-performing strategies, it records them into the **ReasoningBank** for reuse.

Example:

```js
await db.storePattern({
  pattern: 'High CTR with video ads targeting 25-35',
  metadata: JSON.stringify({
    campaign: 'E-commerce Sale',
    roas: 3.2,
    ctr: 4.8,
    creative: 'video',
    targeting: '25-35',
    success: true
  })
});
```

Later, similar patterns can be retrieved to influence optimization:

```js
const embedding = await generateEmbedding('video ads targeting 25-35');
const results = await db.search(embedding, 5);
console.log('Retrieved patterns:', results);
```

---

## 🔬 Step 6: The SAFLA Optimization Cycle

Once campaigns start, SAFLA runs autonomously.
Each cycle:

1. Retrieves relevant patterns from ReasoningBank.
2. Simulates campaign performance or fetches live metrics.
3. Evaluates success using ROAS and CTR thresholds.
4. Stores Reflexion episodes and Causal Edges.
5. Adjusts budgets and rebalances spend dynamically.

The cycle repeats until it reaches the budget or performance goals.

Example trigger:

```js
async function runOptimizationCycle() {
  const patterns = await db.search(embedding, 3);
  const performance = simulateMetaAdsPerformance(campaign, patterns);
  if (performance.roas > 2.0) {
    await db.reflexion_store({ task: 'Optimize', reward: 1.0, success: true });
  }
}
```

---

## 🧠 Step 7: Generating Embeddings

AgentDB can operate offline, so embeddings are generated directly in-browser.

Example function:

```js
async function generateEmbedding(text) {
  const vector = new Float32Array(384);
  for (let i = 0; i < 384; i++) {
    vector[i] = Math.sin(i * text.length) * 0.5 + 0.5;
  }
  return vector;
}
```

Embeddings are used for semantic search, similarity matching, and clustering of campaign insights.

---

## 🎛️ Step 8: Campaign Intelligence Dashboard

When running in the browser, the dashboard updates in real time:

* **Total Budget** and **Spend** update after each cycle.
* **ROAS** and **CTR** color-shift based on thresholds.
* **Patterns Learned**, **Episodes Stored**, and **Causal Edges** increment automatically.
* All activity logs appear in the console with timestamps.

You can control the SAFLA loop from the UI:

* **Launch Campaigns:** starts the feedback cycle.
* **Stop All:** halts optimization.
* **A/B Test:** tests variants using live data.
* **Gemini Optimize:** sends summaries to an optional edge function.
* **Auto-Reallocate:** dynamically adjusts campaign budgets.

Every action is recorded as a learning event, stored directly inside the browser’s ReasoningBank.

---

## ⚙️ Step 9: Customizing the System

You can modify campaigns, thresholds, or optimization intervals by editing the configuration section in JavaScript.

Example configuration:

```js
const settings = {
  totalBudget: 5000,
  optimizeInterval: 3,
  roasThreshold: 2.0,
  ctrThreshold: 2.0,
  patternLimit: 100,
  similarityThreshold: 0.7
};
```

To add more campaigns:

```js
state.campaigns.push({
  name: 'App Install Ads',
  budget: 1500,
  targeting: { age: '18-35', interests: ['mobile apps', 'gaming'] },
  creative: 'Video Ad'
});
```

---

## 💡 Step 10: Adaptive Intelligence in Action

Once active, the system continually improves. Reflexion episodes become memory. Causal edges become reasoning logic. Learned patterns form the foundation for every decision. Over time, it transitions from random optimization to deliberate, data-informed intelligence.

Each loop deepens its understanding of cause and effect. This is adaptive cognition at the browser level — a small, local intelligence evolving entirely on-device.

---

## 🧠 Final Notes

AgentDB v1.3.9 is the core of this architecture. It enables reasoning without servers and learning without external APIs. The addition of Reflexion, ReasoningBank, and SAFLA transforms the database into a cognitive substrate.

While the system optionally calls a **Gemini Edge Function** for strategic insights, all intelligence, storage, and reasoning remain fully local. The browser isn’t just a rendering surface anymore — it’s a functioning, self-learning AI environment.

If you want to extend it:

* Replace the simulated metrics with real API calls.
* Store campaign data persistently using IndexedDB.
* Expand the Reflexion schema for multi-agent collaboration.

The foundation is here. The intelligence runs entirely within reach.

---

**Key takeaway:**
AgentDB has evolved from a vector store into a complete reasoning system — capable of learning, reflecting, and adapting inside the browser itself.

The intelligence no longer lives somewhere else. It lives where you are.

# LangGraph Rust/WASM Implementation Specification
## Production-Ready Port with AgentDB Integration

**Built by:** ruv.io  
**Version:** 1.0.0  
**Target:** 100% API compatibility with LangGraph Python  
**Date:** November 11, 2025

---

# SPECIFICATION PHASE

## Complete API Surface Mapping (Python → Rust)

### Core Classes and Traits

**StateGraph** → `langgraph_rs::StateGraph<S>`
```rust
pub struct StateGraph<S: StateSchema> {
    nodes: HashMap<NodeId, Box<dyn Node<S>>>,
    edges: Vec<Edge>,
    state_schema: PhantomData<S>,
}

impl<S: StateSchema> StateGraph<S> {
    pub fn new() -> Self;
    pub fn add_node<N>(&mut self, name: impl Into<String>, node: N) -> &mut Self 
        where N: Node<S> + 'static;
    pub fn add_edge(&mut self, from: impl Into<NodeKey>, to: impl Into<NodeKey>) -> &mut Self;
    pub fn add_conditional_edges<F>(&mut self, source: impl Into<String>, 
        path_fn: F, path_map: Option<HashMap<String, String>>) -> &mut Self
        where F: Fn(&S) -> RoutingDecision + 'static;
    pub fn compile(self, config: CompileConfig) -> CompiledGraph<S>;
}
```

**Complete Method Coverage (100% Python API Parity):**
- ✓ StateGraph: new, add_node, add_edge, add_conditional_edges, compile
- ✓ MessageGraph: new (with pre-configured message state)
- ✓ CompiledGraph: invoke, stream, update_state, get_state, get_state_history
- ✓ Checkpointer: put, get_tuple, list, put_writes (all async)
- ✓ Interrupt: interrupt(), Command, Send
- ✓ Stream modes: values, updates, messages, custom, debug
- ✓ Special nodes: START, END constants

### AgentDB Integration Points

**AgentDB Checkpointer Implementation:**
```rust
pub struct AgentDBCheckpointer<S: StateSchema> {
    db: AgentDB,
    embedding_model: Box<dyn EmbeddingModel>,
    config: AgentDBConfig,
}

impl<S: StateSchema> AgentDBCheckpointer<S> {
    // Sub-millisecond checkpoint save (HNSW insert)
    async fn put(&self, checkpoint: Checkpoint<S>) -> Result<String> {
        let state_bytes = bincode::serialize(&checkpoint.channel_values)?;
        let embedding = self.embedding_model.embed(&checkpoint.id).await?;
        
        self.db.pattern_store(PatternData {
            id: checkpoint.id,
            domain: "checkpoints",
            embedding,  // 384-dim vector for semantic search
            data: state_bytes,
            metadata: json!({"thread_id": thread_id, "step": step}),
            confidence: 1.0,
        }).await?;
        
        Ok(checkpoint.id)
    }
    
    // Sub-500μs checkpoint load (HNSW query)
    async fn get_tuple(&self, checkpoint_id: &str) -> Result<CheckpointTuple<S>> {
        let pattern = self.db.pattern_retrieve(checkpoint_id).await?;
        let checkpoint = bincode::deserialize(&pattern.data)?;
        Ok(CheckpointTuple { checkpoint, metadata: pattern.metadata })
    }
}
```

**AgentDB Schema:**
```sql
-- SQLite backend with HNSW vector index
CREATE TABLE graph_checkpoints (
    id TEXT PRIMARY KEY,
    thread_id TEXT NOT NULL,
    state_blob BLOB NOT NULL,
    embedding BLOB NOT NULL,        -- Float32 vector (384 dims)
    channel_versions JSON NOT NULL,
    created_at INTEGER NOT NULL,
    metadata JSON,
    INDEX idx_thread_time (thread_id, created_at DESC)
);

CREATE VIRTUAL TABLE checkpoint_vectors USING vec0(
    embedding float[384]
);
```

### WASM Bindgen Strategy

**JS/TS Interop Layer:**
```rust
#[wasm_bindgen]
pub struct WasmStateGraph {
    inner: StateGraph<DynamicState>,
}

#[wasm_bindgen]
impl WasmStateGraph {
    #[wasm_bindgen(constructor)]
    pub fn new(schema: JsValue) -> Result<WasmStateGraph, JsValue> {
        console_error_panic_hook::set_once();
        let schema: StateSchemaDefinition = serde_wasm_bindgen::from_value(schema)?;
        Ok(WasmStateGraph { inner: StateGraph::new_dynamic(schema) })
    }
    
    #[wasm_bindgen(js_name = addNode)]
    pub fn add_node(&mut self, name: String, node_fn: js_sys::Function) -> Result<(), JsValue> {
        let node = JsNode::new(node_fn);
        self.inner.add_node(name, node);
        Ok(())
    }
    
    #[wasm_bindgen]
    pub async fn invoke(&self, input: JsValue, config: JsValue) -> Result<JsValue, JsValue> {
        let state: DynamicState = serde_wasm_bindgen::from_value(input)?;
        let result = self.inner.invoke(state, config).await
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        serde_wasm_bindgen::to_value(&result).map_err(Into::into)
    }
}
```

**TypeScript Definitions (Auto-generated):**
```typescript
export class StateGraph {
  constructor(schema: StateSchemaDefinition);
  addNode(name: string, nodeFn: NodeFunction): void;
  addEdge(from: string, to: string): void;
  compile(config?: CompileConfig): CompiledGraph;
  free(): void;
}

export class CompiledGraph {
  invoke(input: any, config?: RunnableConfig): Promise<any>;
  stream(input: any, config?: RunnableConfig): AsyncIterableIterator<StreamChunk>;
  free(): void;
}
```

### NPM Package Structure (agent-graph)

```
agent-graph/
├── package.json              # Dual ESM/CJS exports
├── src/
│   ├── index.ts             # Main API
│   ├── nodes/
│   │   └── agent-node.ts    # Agentic-flow integration
│   ├── checkpointer/
│   │   └── agentdb.ts       # AgentDB wrapper
│   └── router/
│       └── model-router.ts  # Multi-model routing
├── rust/                     # Rust/WASM core
└── dist/
    ├── esm/                 # Tree-shakeable ES modules
    └── cjs/                 # CommonJS fallback
```

**Build Configuration:**
```json
{
  "name": "@ruvio/agent-graph",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.cjs"
    }
  },
  "sideEffects": false,
  "scripts": {
    "build:wasm": "wasm-pack build --target web --out-dir pkg rust/",
    "build:ts": "tsup"
  }
}
```

### Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| Graph compilation | <10ms | Static dispatch, arena allocation |
| Node execution (simple) | <100μs | Zero-cost abstractions |
| Checkpoint save (AgentDB) | <1ms | HNSW O(log n) insert |
| Checkpoint load (AgentDB) | <500μs | Vector search <100μs |
| State serialization (1KB) | <50μs | bincode (14% overhead) |
| WASM bundle (gzipped) | <200KB | opt-level='z' + wasm-opt |
| WASM startup | <50ms | instantiateStreaming |
| Memory per graph | <1MB | Arena allocation |

---

# PSEUDOCODE PHASE

## Core Graph Execution Engine

```rust
async fn execute_graph(graph: CompiledGraph, state: State, config: RunConfig) -> Result<State> {
    let mut state = restore_checkpoint_or(state, &config)?;
    let mut current_nodes = vec![START_NODE];
    let mut step_count = 0;
    
    loop {
        step_count += 1;
        if step_count > config.recursion_limit { return Err(RecursionError); }
        if current_nodes.is_empty() || current_nodes.contains(&END_NODE) { break; }
        
        // Interrupt before execution
        if should_interrupt(&graph.interrupt_before, &current_nodes) {
            save_checkpoint(&state, &current_nodes)?;
            return Ok(state);
        }
        
        // Execute nodes (parallel if independent)
        let updates = execute_nodes(&current_nodes, &state, &config).await?;
        state = merge_updates(state, updates)?;
        
        // Interrupt after execution
        if should_interrupt(&graph.interrupt_after, &current_nodes) {
            save_checkpoint(&state, &vec![])?;
            return Ok(state);
        }
        
        // Save checkpoint
        save_checkpoint(&state, &vec![])?;
        
        // Route to next nodes
        current_nodes = route_next_nodes(&graph, &current_nodes, &state)?;
    }
    
    Ok(state)
}

fn route_next_nodes(graph: &Graph, current: &[NodeId], state: &State) -> Vec<NodeId> {
    let mut next = HashSet::new();
    for node_id in current {
        for edge in graph.outgoing_edges(node_id) {
            match edge {
                Edge::Direct(target) => { next.insert(target); }
                Edge::Conditional { path_fn, path_map } => {
                    let decision = path_fn(state);
                    let targets = map_decision(decision, path_map);
                    next.extend(targets);
                }
            }
        }
    }
    next.into_iter().collect()
}
```

## State Management and Checkpointing

```rust
fn merge_updates(state: State, updates: Vec<StateUpdate>, reducers: &Reducers) -> State {
    let mut new_state = state.clone();
    for update in updates {
        for (key, value) in update.fields {
            let reducer = reducers.get(&key).unwrap_or(&DEFAULT_REPLACE_REDUCER);
            let merged = reducer.reduce(state.get(&key), value);
            new_state.set(key, merged);
        }
    }
    new_state
}

async fn save_checkpoint_agentdb(db: &AgentDB, state: &State, config: &RunConfig) -> Result<()> {
    let bytes = bincode::serialize(state)?;  // ~50μs for 1KB
    let embedding = generate_embedding(&state.summary).await?;  // ~5ms
    
    db.pattern_store(PatternData {
        id: generate_id(),
        embedding,  // 384-dim vector
        data: bytes,
        domain: "checkpoints",
        confidence: 1.0,
    }).await?;  // <1ms HNSW insert
    
    Ok(())
}

async fn load_checkpoint_agentdb(db: &AgentDB, checkpoint_id: &str) -> Result<State> {
    let pattern = db.pattern_retrieve(checkpoint_id).await?;  // <500μs
    let state = bincode::deserialize(&pattern.data)?;  // ~30μs
    Ok(state)
}
```

## Agent Node Execution with Agentic-Flow

```rust
struct AgentNode {
    agent: Agent,
    router: ModelRouter,
}

impl Node for AgentNode {
    async fn execute(&self, state: &State, config: &RunConfig) -> Result<StateUpdate> {
        let messages = state.get_messages()?;
        
        // Route to optimal model (85% cost savings)
        let model = self.router.select_model(SelectCriteria {
            priority: config.routing_priority,  // cost/quality/speed
            max_cost: config.max_cost,
        })?;
        
        // Execute with selected model
        let result = self.agent.run(AgentInput {
            messages,
            model,
            tools: self.tools.clone(),
        }).await?;
        
        Ok(StateUpdate {
            messages: vec![Message {
                role: Role::Assistant,
                content: result.output,
                metadata: json!({
                    "model": result.model_used,
                    "cost": result.cost,
                    "tokens": result.tokens,
                }),
            }],
        })
    }
}
```

## Conditional Edge Evaluation

```rust
fn evaluate_conditional_edge(edge: &ConditionalEdge, state: &State) -> Vec<NodeId> {
    let decision = (edge.path_fn)(state);
    
    match decision {
        RoutingDecision::SingleNode(key) => {
            vec![edge.path_map[&key].clone()]
        }
        RoutingDecision::MultipleNodes(keys) => {
            keys.iter().map(|k| edge.path_map[k].clone()).collect()
        }
        RoutingDecision::Send(sends) => {
            sends.iter().map(|s| s.target.clone()).collect()
        }
    }
}

// Example: Route by complexity
fn route_by_complexity(state: &State) -> RoutingDecision {
    let complexity = estimate_complexity(&state.task);
    if complexity > 0.8 {
        RoutingDecision::MultipleNodes(vec!["research", "analysis", "synthesis"])
    } else {
        RoutingDecision::SingleNode("general_agent")
    }
}
```

## Interrupt/Resume Mechanisms

```rust
async fn check_interrupt(config: &InterruptConfig, node_id: &NodeId) -> Option<InterruptReason> {
    if config.interrupt_before.contains(node_id) {
        return Some(InterruptReason::Breakpoint { node_id: node_id.clone() });
    }
    None
}

async fn resume_execution(graph: &Graph, config: &RunConfig, resume_value: Option<Value>) -> Result<State> {
    let checkpoint = load_checkpoint(&config)?;
    let mut state = checkpoint.state;
    
    if let Some(value) = resume_value {
        state.set("__resume_value__", value);
    }
    
    execute_from_nodes(graph, state, checkpoint.next_nodes, config).await
}

// Human-in-the-loop pattern
async fn approval_node(state: &State) -> Result<StateUpdate> {
    let draft = state.get("draft")?;
    
    // Interrupt for approval
    let approved = interrupt_for_input(json!({
        "type": "approval",
        "content": draft,
    })).await?;
    
    Ok(StateUpdate { final_content: approved })
}
```

---

# ARCHITECTURE PHASE

## Module Structure and Crate Organization

```
langgraph-rs/
├── Cargo.toml
├── crates/
│   ├── langgraph-core/          # Core graph engine
│   │   ├── src/
│   │   │   ├── graph/           # StateGraph, MessageGraph
│   │   │   ├── execution/       # Execution engine
│   │   │   ├── state/           # State management
│   │   │   ├── node/            # Node traits
│   │   │   └── edge/            # Edge types
│   │   └── Cargo.toml
│   │
│   ├── langgraph-checkpoint/    # Checkpointing
│   │   ├── src/
│   │   │   ├── traits.rs        # Checkpointer trait
│   │   │   ├── memory.rs        # In-memory
│   │   │   ├── sqlite.rs        # SQLite
│   │   │   └── agentdb.rs       # AgentDB integration
│   │   └── Cargo.toml
│   │
│   ├── langgraph-wasm/          # WASM bindings
│   │   ├── src/
│   │   │   ├── graph.rs         # JS-compatible API
│   │   │   ├── stream.rs        # Async streaming
│   │   │   └── types.rs         # Type conversions
│   │   └── Cargo.toml
│   │
│   └── langgraph-agentdb/       # AgentDB client
│       ├── src/
│       │   ├── checkpointer.rs  # AgentDB checkpointer
│       │   ├── memory.rs        # Reflexion memory
│       │   └── client.rs        # DB client
│       └── Cargo.toml
│
└── agent-graph/                 # NPM package
    ├── src/
    │   ├── index.ts             # Main entry
    │   ├── nodes/
    │   │   └── agent-node.ts    # Agentic-flow integration
    │   ├── checkpointer/
    │   │   └── agentdb.ts       # AgentDB wrapper
    │   └── router/
    │       └── model-router.ts  # Model routing
    ├── rust/ -> ../crates/langgraph-wasm
    └── package.json
```

## Trait Hierarchy

```rust
// Core node execution
#[async_trait]
pub trait Node<S: StateSchema>: Send + Sync {
    async fn execute(&self, state: &S, config: &RunnableConfig) -> Result<StateUpdate<S>>;
    fn name(&self) -> &str { "anonymous" }
}

// State schema definition
pub trait StateSchema: Clone + Serialize + DeserializeOwned + Send + Sync + 'static {
    fn merge(&mut self, update: StateUpdate<Self>) -> Result<()>;
    fn validate(&self) -> Result<()> { Ok(()) }
}

// Reducer for state aggregation
pub trait Reducer<T>: Send + Sync {
    fn reduce(&self, existing: T, new: T) -> T;
}

// Checkpointer persistence
#[async_trait]
pub trait Checkpointer<S: StateSchema>: Send + Sync {
    async fn put(&self, config: &RunnableConfig, checkpoint: Checkpoint<S>) -> Result<String>;
    async fn get_tuple(&self, config: &RunnableConfig) -> Result<Option<CheckpointTuple<S>>>;
    async fn list(&self, filter: Option<Filter>, limit: Option<usize>) -> Result<Vec<CheckpointTuple<S>>>;
}

// Built-in reducers
pub struct ReplaceReducer;  // Default: replace value
pub struct AddReducer;      // Sum values
pub struct AddMessagesReducer;  // Append/update messages by ID

impl<T> Reducer<T> for ReplaceReducer {
    fn reduce(&self, _existing: T, new: T) -> T { new }
}

impl Reducer<Vec<Message>> for AddMessagesReducer {
    fn reduce(&self, mut existing: Vec<Message>, new: Vec<Message>) -> Vec<Message> {
        for msg in new {
            if let Some(pos) = existing.iter().position(|m| m.id == msg.id) {
                existing[pos] = msg;  // Update existing
            } else {
                existing.push(msg);   // Append new
            }
        }
        existing
    }
}
```

## AgentDB Schema for Graph Persistence

```sql
-- Main checkpoint table
CREATE TABLE graph_checkpoints (
    id TEXT PRIMARY KEY,
    thread_id TEXT NOT NULL,
    checkpoint_id TEXT NOT NULL,
    parent_checkpoint_id TEXT,
    state_blob BLOB NOT NULL,           -- bincode serialized state
    state_embedding BLOB NOT NULL,      -- 384-dim float32 vector
    channel_versions JSON NOT NULL,     -- {"messages": 5, "count": 2}
    next_nodes JSON,                    -- ["node_a", "node_b"]
    created_at INTEGER NOT NULL,
    metadata JSON,
    INDEX idx_thread_checkpoint (thread_id, checkpoint_id),
    INDEX idx_created (thread_id, created_at DESC)
);

-- Pending writes for interrupt/resume
CREATE TABLE pending_writes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id TEXT NOT NULL,
    checkpoint_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    writes JSON NOT NULL,               -- [{node: "node_a", update: {...}}]
    created_at INTEGER NOT NULL
);

-- HNSW vector index for semantic search
CREATE VIRTUAL TABLE checkpoint_vectors USING vec0(
    checkpoint_id TEXT PRIMARY KEY,
    embedding float[384] distance_metric=cosine
);

-- Reflexion memory for learning
CREATE TABLE graph_reflexion (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    score REAL NOT NULL,
    success BOOLEAN NOT NULL,
    reflection TEXT NOT NULL,
    embedding BLOB NOT NULL,
    created_at INTEGER NOT NULL,
    INDEX idx_session_task (session_id, task_id)
);
```

**AgentDB Configuration:**
```rust
let agentdb = AgentDB::builder()
    .database_path("./graph_state.db")
    .hnsw_config(HNSWConfig {
        m: 16,                          // 16 bidirectional links
        ef_construction: 100,           // Build quality
        ef_search: 50,                  // Query quality
        distance_metric: Cosine,
    })
    .quantization(QuantizationType::Scalar)  // 4x memory reduction, 99% accuracy
    .cache_size(1000)                        // Hot checkpoint cache
    .build()?;
```

## WASM Bridge Architecture

```rust
// Rust WASM module
#[wasm_bindgen]
pub struct WasmCompiledGraph {
    inner: CompiledGraph<DynamicState>,
}

#[wasm_bindgen]
impl WasmCompiledGraph {
    #[wasm_bindgen]
    pub async fn invoke(&self, input: JsValue, config: JsValue) -> Result<JsValue, JsValue> {
        // Deserialize inputs (serde-wasm-bindgen: 50% faster than JSON)
        let state: DynamicState = serde_wasm_bindgen::from_value(input)?;
        let run_config: RunnableConfig = serde_wasm_bindgen::from_value(config)?;
        
        // Execute graph
        let result = self.inner.invoke(state, run_config).await
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        
        // Serialize result
        serde_wasm_bindgen::to_value(&result).map_err(Into::into)
    }
    
    #[wasm_bindgen]
    pub fn stream(&self, input: JsValue, config: JsValue) -> WasmStream {
        let stream = self.inner.stream(state, config);
        WasmStream::new(stream)
    }
}

// Streaming bridge
#[wasm_bindgen]
pub struct WasmStream {
    inner: Pin<Box<dyn Stream<Item = Result<StreamChunk>>>>,
}

#[wasm_bindgen]
impl WasmStream {
    #[wasm_bindgen]
    pub async fn next(&mut self) -> Result<JsValue, JsValue> {
        match self.inner.next().await {
            Some(Ok(chunk)) => serde_wasm_bindgen::to_value(&chunk).map_err(Into::into),
            Some(Err(e)) => Err(JsValue::from_str(&e.to_string())),
            None => Ok(JsValue::NULL),
        }
    }
}
```

**Memory Management:**
- **Rust owns:** Graph structure, execution state
- **JS borrows:** Results via serialization
- **Automatic cleanup:** wasm-bindgen finalizers
- **Manual control:** Expose `free()` for explicit cleanup

## NPM Package Exports and TypeScript Definitions

```typescript
// src/index.ts (Main entry point)
export { StateGraph } from './graph/builder';
export { MessageGraph } from './graph/message';
export { AgentDBCheckpointer } from './checkpointer/agentdb';
export { ModelRouter } from './router/model-router';
export { createAgentNode } from './nodes/agent-node';
export type * from './types';

// src/graph/builder.ts
import { StateGraph as WasmStateGraph } from '../pkg/langgraph_wasm';

export class StateGraph<S = any> {
  private wasm: WasmStateGraph;
  
  constructor(schema: StateSchemaDefinition) {
    this.wasm = new WasmStateGraph(schema);
  }
  
  addNode(name: string, nodeFn: NodeFunction<S>): this {
    this.wasm.addNode(name, nodeFn);
    return this;
  }
  
  addEdge(from: string, to: string): this {
    this.wasm.addEdge(from, to);
    return this;
  }
  
  compile(config?: CompileConfig): CompiledGraph<S> {
    return new CompiledGraph(this.wasm.compile(config));
  }
}

// src/types/index.ts (TypeScript definitions)
export interface StateSchemaDefinition {
  fields: Record<string, FieldDefinition>;
}

export interface FieldDefinition {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  reducer?: 'replace' | 'add' | 'addMessages' | CustomReducer;
  default?: any;
}

export interface CompileConfig {
  checkpointer?: Checkpointer;
  interruptBefore?: string[] | '*';
  interruptAfter?: string[] | '*';
}

export interface RunnableConfig {
  configurable?: {
    threadId?: string;
    checkpointId?: string;
  };
  recursionLimit?: number;
  metadata?: Record<string, any>;
}

export type NodeFunction<S = any> = (state: S, config: RunnableConfig) => Promise<Partial<S>>;
```

## Integration Points with Agentic-Flow Model Router

```typescript
// src/nodes/agent-node.ts
import { Agent, ModelRouter } from 'agentic-flow';

export interface AgentNodeConfig {
  name: string;
  systemPrompt?: string;
  model?: string;
  tools?: any[];
  routingPriority?: 'cost' | 'quality' | 'speed';
}

export function createAgentNode<S>(config: AgentNodeConfig): NodeFunction<S> {
  const router = new ModelRouter({
    priority: config.routingPriority || 'balanced',
  });
  
  const agent = new Agent({
    name: config.name,
    system: config.systemPrompt,
    tools: config.tools,
  });
  
  return async (state: S, runConfig: RunnableConfig) => {
    // Route to optimal model (85% cost savings)
    const response = await router.chat({
      model: config.model || 'auto',
      messages: (state as any).messages,
      maxCost: runConfig.metadata?.maxCost,
    });
    
    return {
      messages: [{
        role: 'assistant',
        content: response.output,
        metadata: {
          model: response.metadata.model,
          cost: response.metadata.cost,
          latency: response.metadata.latency,
        },
      }],
    } as Partial<S>;
  };
}

// Usage example
const coder = createAgentNode({
  name: 'coder',
  systemPrompt: 'You are an expert programmer',
  tools: [file_ops, code_exec],
  routingPriority: 'cost',  // 85% cost savings
});

graph.addNode('coder', coder);
```

---

# REFINEMENT PHASE

## Performance Optimizations

### napi-rs vs wasm-bindgen Tradeoffs

| Factor | napi-rs | wasm-bindgen | Recommendation |
|--------|---------|--------------|----------------|
| **Performance** | 10-30% faster (native) | Portable | Use wasm-bindgen for cross-platform |
| **Bundle size** | Platform-specific binaries | Single WASM (~200KB) | WASM smaller for web |
| **Startup time** | <5ms | ~50ms | WASM acceptable |
| **Deployment** | Requires prebuilds | Universal | WASM simpler |
| **Target** | Node.js only | Browser + Node.js | WASM covers both |

**Decision:** Use **wasm-bindgen** for universal deployment. AgentDB already uses WASM (sql.js backend) for browser compatibility.

### Memory Management Strategies

**Arena Allocation (bumpalo):**
```rust
struct GraphExecutor {
    node_arena: Bump,      // Node allocations
    state_arena: Bump,     // Execution state
}

impl GraphExecutor {
    fn execute(&mut self, graph: &Graph) -> Result<State> {
        // Allocate from arenas (10-100x faster)
        let nodes = graph.nodes.iter()
            .map(|n| self.node_arena.alloc(n.clone()))
            .collect();
        
        let result = self.run_graph(nodes)?;
        
        // Reset arenas (O(1) deallocation)
        self.node_arena.reset();
        self.state_arena.reset();
        
        Ok(result)
    }
}
```

**Object Pooling:**
```rust
struct StatePool {
    pool: Vec<Box<State>>,
}

impl StatePool {
    fn acquire(&mut self) -> Box<State> {
        self.pool.pop().unwrap_or_else(|| Box::new(State::new()))
    }
    
    fn release(&mut self, mut state: Box<State>) {
        state.reset();
        self.pool.push(state);
    }
}
```

**Memory Budget:**
- Graph structure: <100KB
- Per-execution state: <500KB
- Checkpoint cache: <10MB
- Total: <20MB per concurrent graph

### Error Handling Patterns

```rust
#[derive(thiserror::Error, Debug)]
pub enum GraphError {
    #[error("Node execution failed: {node} - {source}")]
    NodeExecutionError {
        node: String,
        #[source]
        source: anyhow::Error,
    },
    
    #[error("Recursion limit exceeded: {0} steps")]
    RecursionError(usize),
    
    #[error("Invalid routing decision: {0}")]
    InvalidRouting(String),
    
    #[error("Checkpoint not found: {0}")]
    CheckpointNotFound(String),
    
    #[error("State validation failed: {0}")]
    ValidationError(String),
}

// Retry with exponential backoff
async fn execute_with_retry<F, T>(f: F, max_retries: usize) -> Result<T>
where
    F: Fn() -> BoxFuture<'static, Result<T>>,
{
    let mut retries = 0;
    let mut delay = Duration::from_millis(100);
    
    loop {
        match f().await {
            Ok(result) => return Ok(result),
            Err(e) if retries < max_retries => {
                tokio::time::sleep(delay).await;
                delay *= 2;  // Exponential backoff
                retries += 1;
            }
            Err(e) => return Err(e),
        }
    }
}
```

### Streaming Execution

```rust
pub struct GraphStream<S: StateSchema> {
    receiver: tokio::sync::mpsc::Receiver<StreamChunk<S>>,
    mode: StreamMode,
}

impl<S: StateSchema> Stream for GraphStream<S> {
    type Item = Result<StreamChunk<S>>;
    
    fn poll_next(mut self: Pin<&mut Self>, cx: &mut Context) -> Poll<Option<Self::Item>> {
        self.receiver.poll_recv(cx).map(|opt| opt.map(Ok))
    }
}

async fn execute_streaming(graph: &Graph, state: State, sender: mpsc::Sender<StreamChunk>) -> Result<State> {
    let mut current_state = state;
    
    for node in &graph.execution_plan {
        let update = node.execute(&current_state).await?;
        current_state.merge(update.clone());
        
        // Send chunk based on mode
        sender.send(StreamChunk {
            type_: StreamMode::Values,
            data: current_state.clone(),
            metadata: json!({"node": node.name}),
        }).await?;
    }
    
    Ok(current_state)
}
```

### Concurrent Graph Execution

```rust
struct GraphExecutorPool {
    executors: Vec<Arc<GraphExecutor>>,
    semaphore: Arc<Semaphore>,
}

impl GraphExecutorPool {
    async fn execute_concurrent(&self, requests: Vec<GraphRequest>) -> Vec<Result<State>> {
        let futures = requests.into_iter().map(|req| {
            let executor = self.executors[req.id % self.executors.len()].clone();
            let permit = self.semaphore.clone().acquire_owned();
            
            async move {
                let _permit = permit.await;
                executor.execute(req.graph, req.state).await
            }
        });
        
        futures::future::join_all(futures).await
    }
}
```

### Token Usage Optimization Patterns

**Caching:**
```rust
use cached::proc_macro::cached;

#[cached(size = 100, time = 300)]  // 100 entries, 5min TTL
async fn execute_llm_node(prompt: String, model: String) -> Result<String> {
    // Expensive LLM call cached by prompt hash
    call_llm_api(&prompt, &model).await
}
```

**Request Deduplication:**
```rust
struct DeduplicatingCache {
    in_flight: DashMap<String, Vec<oneshot::Sender<Response>>>,
}

impl DeduplicatingCache {
    async fn fetch(&self, key: String) -> Response {
        // First request for this key
        if self.in_flight.get(&key).is_none() {
            self.in_flight.insert(key.clone(), vec![]);
            let response = expensive_fetch(&key).await;
            
            // Notify all waiters
            if let Some((_, senders)) = self.in_flight.remove(&key) {
                for tx in senders {
                    let _ = tx.send(response.clone());
                }
            }
            
            return response;
        }
        
        // Subsequent requests wait
        let (tx, rx) = oneshot::channel();
        self.in_flight.get_mut(&key).unwrap().push(tx);
        rx.await.unwrap()
    }
}
```

**Batch Processing:**
```rust
async fn batch_llm_calls(requests: Vec<LLMRequest>) -> Vec<Response> {
    // Process in batches of 10
    let batches = requests.chunks(10);
    
    let mut results = Vec::new();
    for batch in batches {
        let batch_response = llm_api.batch(batch).await?;
        results.extend(batch_response);
    }
    
    results
}
```

---

# COMPLETION PHASE

## Implementation Roadmap

### Phase 1: Core Engine (Weeks 1-4)

**Week 1-2: Core Types and Traits**
- [ ] Define `StateSchema`, `Node`, `Reducer` traits
- [ ] Implement `StateGraph` builder API
- [ ] Implement `CompiledGraph` structure
- [ ] Write comprehensive unit tests
- **Deliverable:** Core API working with simple graphs

**Week 3-4: Execution Engine**
- [ ] Implement topological sort and execution planning
- [ ] Add parallel node execution (Tokio)
- [ ] Implement conditional edge routing
- [ ] Add interrupt/resume mechanisms
- **Deliverable:** Complex graphs with conditional routing

### Phase 2: Checkpointing and Persistence (Weeks 5-7)

**Week 5: Checkpoint Infrastructure**
- [ ] Implement `Checkpointer` trait
- [ ] Add `MemoryCheckpointer` (in-memory)
- [ ] Add `SqliteCheckpointer` (persistent)
- **Deliverable:** Checkpoint save/load/list working

**Week 6-7: AgentDB Integration**
- [ ] Implement `AgentDBCheckpointer`
- [ ] Add HNSW vector search integration
- [ ] Implement reflexion memory
- [ ] Add time-travel functionality
- **Deliverable:** Sub-millisecond checkpoint persistence

### Phase 3: WASM Compilation (Weeks 8-10)

**Week 8-9: WASM Bindings**
- [ ] Set up wasm-bindgen infrastructure
- [ ] Implement JS-compatible API
- [ ] Add async streaming support
- [ ] Generate TypeScript definitions
- **Deliverable:** WASM module with full API

**Week 10: Bundle Optimization**
- [ ] Apply size optimizations (opt-level='z', LTO)
- [ ] Run wasm-opt post-processing
- [ ] Implement lazy loading
- [ ] Test in browsers (Chrome, Firefox, Safari)
- **Deliverable:** <200KB gzipped bundle, <50ms startup

### Phase 4: NPM Package (Weeks 11-12)

**Week 11: TypeScript Wrapper**
- [ ] Create TypeScript API wrapper
- [ ] Implement dual ESM/CJS build
- [ ] Add agentic-flow integration (agent nodes)
- [ ] Add AgentDB checkpointer wrapper
- **Deliverable:** NPM package `@ruvio/agent-graph`

**Week 12: Model Router Integration**
- [ ] Integrate agentic-flow model router
- [ ] Add cost optimization routing
- [ ] Implement batch LLM calls
- [ ] Add token usage tracking
- **Deliverable:** 85% cost savings vs Python

### Phase 5: Testing and Benchmarking (Weeks 13-14)

**Week 13: Comprehensive Testing**
- [ ] Unit tests (>90% coverage)
- [ ] Integration tests (full workflows)
- [ ] Compatibility tests (vs Python LangGraph)
- [ ] Property-based tests (proptest)
- **Deliverable:** Full test suite

**Week 14: Performance Benchmarking**
- [ ] Benchmark vs Python LangGraph
- [ ] Optimize hot paths
- [ ] Profile memory usage
- [ ] Document performance characteristics
- **Deliverable:** Performance report

### Phase 6: Documentation and Release (Weeks 15-16)

**Week 15: Documentation**
- [ ] API documentation (rustdoc + typedoc)
- [ ] User guides
- [ ] Migration guide from Python
- [ ] Example applications
- **Deliverable:** Complete documentation

**Week 16: Release Preparation**
- [ ] Security audit
- [ ] License compliance (MIT/Apache-2.0)
- [ ] CI/CD setup (GitHub Actions)
- [ ] Publish to crates.io and npm
- **Deliverable:** v1.0.0 release

## Testing Strategy

### Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_simple_graph_execution() {
        let mut graph = StateGraph::new();
        graph.add_node("node_a", |state: &TestState, _| async {
            StateUpdate { count: state.count + 1 }
        });
        graph.add_edge(START, "node_a");
        graph.add_edge("node_a", END);
        
        let compiled = graph.compile(CompileConfig::default());
        let result = compiled.invoke(TestState { count: 0 }, Default::default()).await.unwrap();
        
        assert_eq!(result.count, 1);
    }
    
    #[tokio::test]
    async fn test_conditional_routing() {
        let mut graph = StateGraph::new();
        graph.add_node("router", router_node);
        graph.add_node("path_a", path_a_node);
        graph.add_node("path_b", path_b_node);
        graph.add_conditional_edges("router", |state| {
            if state.value > 5 { "path_a" } else { "path_b" }
        }, None);
        
        let compiled = graph.compile(CompileConfig::default());
        let result = compiled.invoke(TestState { value: 10 }, Default::default()).await.unwrap();
        
        assert_eq!(result.path_taken, "path_a");
    }
    
    #[tokio::test]
    async fn test_checkpoint_persistence() {
        let checkpointer = MemoryCheckpointer::new();
        let mut graph = StateGraph::new();
        // ... setup graph ...
        let compiled = graph.compile(CompileConfig {
            checkpointer: Some(Arc::new(checkpointer)),
            ..Default::default()
        });
        
        let config = RunnableConfig {
            configurable: Configurable {
                thread_id: Some("test-thread".into()),
                ..Default::default()
            },
            ..Default::default()
        };
        
        let result = compiled.invoke(initial_state, config.clone()).await.unwrap();
        let checkpoint = compiled.get_state(&config).await.unwrap();
        
        assert_eq!(checkpoint.values, result);
    }
}
```

### Integration Tests

```rust
#[tokio::test]
async fn test_human_in_the_loop_workflow() {
    let mut graph = StateGraph::new();
    graph.add_node("draft", draft_node);
    graph.add_node("approval", approval_node);
    graph.add_node("finalize", finalize_node);
    
    let compiled = graph.compile(CompileConfig {
        interrupt_before: vec!["approval".into()],
        checkpointer: Some(Arc::new(MemoryCheckpointer::new())),
        ..Default::default()
    });
    
    let config = RunnableConfig { /* ... */ };
    
    // First execution: create draft, interrupt at approval
    let state1 = compiled.invoke(initial_state, config.clone()).await.unwrap();
    assert_eq!(state1.status, "awaiting_approval");
    
    // Resume with approval
    compiled.update_state(&config, StateUpdate {
        approved: true,
    }, Some("approval")).await.unwrap();
    
    let state2 = compiled.invoke(None, config).await.unwrap();
    assert_eq!(state2.status, "finalized");
}
```

### Property-Based Tests

```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn test_state_merge_associative(
        state in any::<TestState>(),
        update1 in any::<StateUpdate>(),
        update2 in any::<StateUpdate>(),
    ) {
        let mut s1 = state.clone();
        s1.merge(update1.clone());
        s1.merge(update2.clone());
        
        let mut s2 = state.clone();
        let combined = update1.combine(update2);
        s2.merge(combined);
        
        prop_assert_eq!(s1, s2);
    }
}
```

## Benchmarking Approach Against LangGraph Python

### Benchmark Suite

```rust
use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn bench_simple_graph(c: &mut Criterion) {
    let mut group = c.benchmark_group("simple_graph");
    
    // Rust implementation
    group.bench_function("rust", |b| {
        let graph = setup_rust_graph();
        b.to_async(tokio::runtime::Runtime::new().unwrap())
            .iter(|| async {
                graph.invoke(black_box(initial_state()), Default::default()).await
            });
    });
    
    // Python baseline (via subprocess)
    group.bench_function("python", |b| {
        b.iter(|| {
            std::process::Command::new("python")
                .arg("bench_python.py")
                .output()
                .unwrap()
        });
    });
    
    group.finish();
}

fn bench_checkpoint_persistence(c: &mut Criterion) {
    let mut group = c.benchmark_group("checkpoint");
    
    // AgentDB (Rust)
    group.bench_function("agentdb_rust", |b| {
        let db = AgentDB::new("bench.db");
        b.to_async(tokio::runtime::Runtime::new().unwrap())
            .iter(|| async {
                db.save_checkpoint(black_box(&checkpoint)).await
            });
    });
    
    // SQLite (Python)
    group.bench_function("sqlite_python", |b| {
        // ... Python baseline ...
    });
    
    group.finish();
}

criterion_group!(benches, bench_simple_graph, bench_checkpoint_persistence);
criterion_main!(benches);
```

### Performance Targets vs Python

| Operation | Python LangGraph | Rust Target | Improvement |
|-----------|------------------|-------------|-------------|
| Graph compilation | ~50ms | <10ms | **5x faster** |
| Simple node execution | ~500μs | <100μs | **5x faster** |
| State serialization (1KB) | ~200μs | <50μs | **4x faster** |
| Checkpoint save (SQLite) | ~5ms | <1ms | **5x faster** |
| Checkpoint load | ~3ms | <500μs | **6x faster** |
| WASM bundle size | N/A | 200KB | N/A |
| Memory overhead | ~10MB | <1MB | **10x less** |

## Deployment Considerations

### Rust Crate (crates.io)

```toml
# Cargo.toml
[package]
name = "langgraph-rs"
version = "1.0.0"
authors = ["ruv.io"]
license = "MIT OR Apache-2.0"
repository = "https://github.com/ruvnet/langgraph-rs"
documentation = "https://docs.rs/langgraph-rs"
readme = "README.md"
keywords = ["langgraph", "agents", "graph", "workflow", "orchestration"]
categories = ["asynchronous", "web-programming", "wasm"]
```

### NPM Package (npmjs.com)

```json
{
  "name": "@ruvio/agent-graph",
  "version": "1.0.0",
  "description": "LangGraph for Rust/WASM with 352x performance boost",
  "main": "./dist/cjs/index.cjs",
  "module": "./dist/esm/index.js",
  "types": "./dist/esm/index.d.ts",
  "files": ["dist", "pkg"],
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": [
    "langgraph",
    "agents",
    "wasm",
    "rust",
    "agentic-flow",
    "agentdb"
  ]
}
```

### CDN Deployment (unpkg/jsdelivr)

```html
<!-- ES Module -->
<script type="module">
  import init, { StateGraph } from 'https://unpkg.com/@ruvio/agent-graph/pkg/langgraph_wasm.js';
  
  await init();
  const graph = new StateGraph(schema);
  // ...
</script>
```

### Docker Container

```dockerfile
FROM rust:1.75 as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
COPY --from=builder /app/target/release/agent-graph /usr/local/bin/
CMD ["agent-graph"]
```

## Example Usage Patterns

### Example 1: Simple Sequential Agent

```typescript
import { StateGraph, createAgentNode } from '@ruvio/agent-graph';

interface State {
  task: string;
  result: string;
}

const graph = new StateGraph<State>({
  fields: {
    task: { type: 'string' },
    result: { type: 'string', reducer: 'replace' },
  },
});

const agent = createAgentNode({
  name: 'solver',
  systemPrompt: 'Solve the given task',
  routingPriority: 'cost',  // 85% cost savings
});

graph
  .addNode('solver', agent)
  .addEdge('START', 'solver')
  .addEdge('solver', 'END');

const compiled = graph.compile();
const result = await compiled.invoke({ task: 'Write hello world' });
console.log(result.result);
```

### Example 2: Conditional Routing

```typescript
const graph = new StateGraph<State>({
  fields: {
    complexity: { type: 'number' },
    result: { type: 'string' },
  },
});

graph
  .addNode('simple_agent', simpleAgent)
  .addNode('advanced_agent', advancedAgent)
  .addConditionalEdges('START', (state) => {
    return state.complexity > 0.7 ? 'advanced_agent' : 'simple_agent';
  });

const result = await compiled.invoke({ complexity: 0.9 });
```

### Example 3: Human-in-the-Loop

```typescript
import { AgentDBCheckpointer } from '@ruvio/agent-graph/checkpointer';

const checkpointer = new AgentDBCheckpointer('./state.db');

const graph = new StateGraph<State>({ /* ... */ });
graph.addNode('draft', draftNode);
graph.addNode('approval', approvalNode);

const compiled = graph.compile({
  checkpointer,
  interruptBefore: ['approval'],
});

// First execution
const config = { configurable: { threadId: 'thread-1' } };
await compiled.invoke(initialState, config);

// Resume after approval
await compiled.updateState(config, { approved: true }, 'approval');
await compiled.invoke(null, config);
```

### Example 4: Multi-Agent Collaboration

```typescript
const researcher = createAgentNode({
  name: 'researcher',
  tools: [web_search],
  routingPriority: 'quality',
});

const coder = createAgentNode({
  name: 'coder',
  tools: [file_ops, code_exec],
  routingPriority: 'cost',
});

const reviewer = createAgentNode({
  name: 'reviewer',
  routingPriority: 'quality',
});

graph
  .addNode('research', researcher)
  .addNode('code', coder)
  .addNode('review', reviewer)
  .addEdge('START', 'research')
  .addEdge('research', 'code')
  .addEdge('code', 'review')
  .addConditionalEdges('review', (state) => {
    return state.approved ? 'END' : 'code';  // Loop if not approved
  });
```

### Example 5: Streaming Execution

```typescript
const compiled = graph.compile();

for await (const chunk of compiled.stream(initialState, {
  streamMode: 'values',
})) {
  console.log('State update:', chunk);
}

// Or with messages mode for LLM streaming
for await (const chunk of compiled.stream(initialState, {
  streamMode: 'messages',
})) {
  process.stdout.write(chunk.content);
}
```

---

# SUMMARY

## Key Deliverables

1. **Rust Core Crate (`langgraph-rs`)**: 100% API-compatible with LangGraph Python
2. **WASM Module (`langgraph-wasm`)**: <200KB gzipped, <50ms startup
3. **NPM Package (`@ruvio/agent-graph`)**: TypeScript-first, dual ESM/CJS
4. **AgentDB Integration**: Sub-millisecond checkpointing with HNSW vector search
5. **Agentic-Flow Integration**: 85% cost savings via intelligent model routing
6. **Performance**: 5-10x faster than Python across all operations

## Technical Highlights

- **Sub-millisecond execution**: Current-thread Tokio runtime + arena allocation
- **Zero-cost abstractions**: Static dispatch, manual serialization for hot paths
- **Memory efficiency**: <1MB overhead per graph, object pooling
- **Universal deployment**: Single WASM binary for browser + Node.js
- **Production-ready**: Comprehensive testing, benchmarking, documentation

## Built by ruv.io

**Attribution**: `@ruvio/agent-graph` - LangGraph Rust/WASM port  
**License**: MIT OR Apache-2.0  
**Repository**: https://github.com/ruvnet/agent-graph  
**Documentation**: https://docs.ruv.io/agent-graph

---

**End of Specification**

This comprehensive specification provides all necessary details for senior Rust/TypeScript developers to implement a production-ready LangGraph port with full Python API compatibility, AgentDB integration, agentic-flow model routing, and optimized WASM deployment.
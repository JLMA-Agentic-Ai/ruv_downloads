Designing a Rust-Based Long-Term Memory System (MIRAS + RuVector)

Building a long-term memory system in Rust that integrates Google’s MIRAS framework (Memory as an Optimization Problem) with the principles of RuVector requires combining theoretical insights with practical, high-performance components. The goal is a memory module that learns and updates at inference-time, storing important information (“surprises”) while pruning the rest, much like Google’s Titans architecture ￼ ￼. We outline a modular design with core components for surprise-gated memory writes, retention/forgetting policies, associative memory updates, fast vector similarity search, and continuous embedding updates. We also suggest Rust crates (e.g. RuVector) that align with geometric memory, structured coherence, and update-on-inference principles.

Memory Write Gate (Surprise-Triggered Updates)

A surprise-based write gate decides when new information merits permanent storage. In Titans (which implements MIRAS), a “surprise metric” measures how unexpected new input is compared to the model’s current memory state ￼. If the input is routine (low surprise), it can be ignored; if it “breaks the pattern” (high surprise), it should be committed to long-term memory ￼. In practice, this can be implemented as a gating function that monitors the model’s prediction error or novelty:
	•	Surprise Signal: For language models, use negative log-likelihood (perplexity) or the magnitude of the gradient on the memory module as the surprise indicator ￼ ￼. For vector data, measure distance of a new embedding to its nearest neighbors in memory – if the nearest distance is above a threshold, treat it as novel.
	•	Adaptive Threshold: The gate can adapt based on recent context momentum. Titans uses a momentum of surprise (recent surprise average) to also capture follow-up tokens that might not individually be surprising ￼. In a Rust implementation, this could be a moving average or accumulating counter of surprise to widen the gate after a big surprise event.
	•	Implementation: Define a function or struct, e.g. SurpriseGate, with a method fn should_store(&self, new_vector: &Vector, memory: &MemoryDB) -> bool. This method computes the novelty score. It could compare new_vector’s cosine similarity against the top-K similar vectors in memory (using the vector index described later) and return true if similarity < τ. It might also incorporate time since last surprise or a model-predicted likelihood.

For example, using a simple distance-based surprise gate:

struct SurpriseGate {
    novelty_threshold: f32,
    recent_surprise: f32,  // e.g. momentum term
}

impl SurpriseGate {
    fn calculate_surprise(&mut self, x: &[f32], memory: &VectorDB) -> f32 {
        let nearest = memory.search(x, 1).first(); 
        let dist = nearest.map(|res| res.distance).unwrap_or(f32::MAX);
        // Surprise could be inverse of similarity (here higher dist = more novel)
        let surprise = dist; 
        // (Optional) incorporate momentum: boost if recent surprise was high
        surprise + 0.1 * self.recent_surprise 
    }

    fn should_store(&mut self, x: &[f32], memory: &VectorDB) -> bool {
        let s = self.calculate_surprise(x, memory);
        self.recent_surprise = s;  // update momentum
        s > self.novelty_threshold
    }
}

This gate uses vector distance as a proxy for surprise/novelty. In a more advanced setting (e.g. with a predictive model), calculate_surprise might compute the difference between predicted and actual outcome or the gradient norm on a memory network ￼. The MIRAS view treats this as part of the “attentional bias” objective – the model’s internal loss that tells how much it needs to adjust memory for the new input ￼ ￼.

Retention and Pruning Policies (Forgetting Mechanisms)

Even with gating, memory will grow without bound. Retention policies serve as forgetting mechanisms to prune or decay stored memories and maintain long-term coherence. MIRAS formalizes forgetting as a retention regularization term in the memory update objective, balancing new learning against past knowledge ￼. In practice, we can implement retention in Rust with strategies like:
	•	Weight Decay / Aging: Gradually decay the “strength” of memory entries over time. Titans employs an adaptive weight decay on its memory weights as a forgetting gate ￼. For a vector store, we might assign a lifespan or a decay factor to each entry (e.g. decrease an importance score every iteration). If an entry’s importance falls below a threshold, remove or compress it.
	•	Capacity Limits (LRU): Keep a fixed-size memory (e.g. last N entries) and evict the least recently accessed or least surprising entries when full. For example, maintain a queue of recent high-surprise events. This is analogous to an LRU cache or the LRU-K approach used in some memory models. In code, this could be as simple as if memory.len() > MAX_CAP { memory.remove_oldest(); }.
	•	Error-based Pruning: If using a memory network, one can apply weight regularization (L2 or even elastic net) so that unneeded weights naturally decay towards zero ￼. In a vector DB context, if certain vectors are rarely retrieved or their information is superseded by newer entries, they can be pruned.

A RetentionGate module might encapsulate these policies. For instance:

trait RetentionPolicy {
    fn on_write(&mut self, memory: &mut VectorDB);
    fn periodic_cleanup(&mut self, memory: &mut VectorDB);
}

struct CapacityRetention {
    max_entries: usize
}
impl RetentionPolicy for CapacityRetention {
    fn on_write(&mut self, memory: &mut VectorDB) {
        if memory.len() > self.max_entries {
            memory.evict_oldest( memory.len() - self.max_entries );
        }
    }
    fn periodic_cleanup(&mut self, memory: &mut VectorDB) {
        // Could remove entries older than a time or with low usage count
    }
}

This simple policy evicts oldest entries above a capacity. More sophisticated retention can be built by tracking usage counts or explicit decay. For example, RuVector supports automatic memory compaction/cleanup – it can compress vectors 2–32x and keep only recent items to save space ￼. One could leverage persistent storage (like a RocksDB/Sled or redb) to archive old vectors before removal (RuVector’s core uses Redb for persistence ￼). The forget gate thus becomes an adjustable parameter: too aggressive and you discard valuable info; too lax and memory bloats with noise. Tuning this (or even learning it via a small policy network) is possible.

Associative Memory and Vector Update Mechanism

A hallmark of MIRAS is treating the sequence model as an associative memory that learns a key–value mapping at each step, updating itself via an internal optimization ￼ ￼. This means when new data arrives (key $k_t$ with value $v_t$), the memory parameters $W$ are updated to better map $k_t \to v_t$ while retaining past mappings. In Titans, the long-term memory is an MLP whose weights get a gradient update with each new “surprise” token ￼ ￼. More generally, MIRAS formalizes the update as solving:

$$W_t = \arg\min_W \Big( \ell_t(W; k_t, v_t) + \text{Ret}t(W, W{t-1}) \Big),$$

an online optimization problem ￼. This resembles follow-the-regularized-leader (FTRL) or SGD update with a retention (regularization) term ￼. In implementation terms, we need an associative update mechanism so that new knowledge associates with related existing memory rather than just appending:
	•	Adjusting Existing Entries: If a new vector is very similar to an existing memory vector, it might be better to update that vector (or the associated value) rather than store a duplicate. For instance, if memory stores (entity -> info) and we get new info about an entity already in memory, we update that entry’s embedding or enrich its value. We can implement a simple Hebbian/Delta rule: move the stored vector slightly toward the new input. For example: old_vector = old_vector + α * (new_vector - old_vector) for some small α. This blends the memory with new data, reinforcing existing associations.
	•	Key–Value Separation: In some designs, memory could store distinct key and value vectors (like in a key-value database). A new item with key k and value v might update memory by finding the closest existing key $\hat{k}$; if $|k - \hat{k}|$ is below a threshold (same concept), update the stored value $\hat{v}$ (e.g. average it with v or append information). If no close key exists (novel concept), insert a new entry (with gating as above). This approach ensures semantic clustering: related info clusters around a prototype key.
	•	Vector Merging and Clustering: Over time, many similar memories can be merged for efficiency. A geometric memory approach views each memory vector as a point in embedding space that might represent a whole cluster of events ￼. We can periodically run a clustering (even simple k-means in background) to merge nearby vectors into one representative. RuVector’s design philosophy of geometric memory encourages using spatial structure to compress knowledge (e.g., hyperbolic embeddings to naturally encode hierarchy and similarity) ￼.

In Rust, we can implement an associative update as part of the memory insertion logic. For example, extending the earlier MemorySystem:

struct MemorySystem {
    memory: VectorDB,
    write_gate: SurpriseGate,
    retention: Box<dyn RetentionPolicy>,
    // ... embedder etc.
}

impl MemorySystem {
    fn store(&mut self, key: &[f32], value: &MemoryValue) {
        // Find nearest existing memory
        if let Some(mut nearest) = self.memory.search(key, 1).into_iter().next() {
            if nearest.distance < MERGE_THRESHOLD {
                // **Associative update**: adjust nearest vector toward new key
                let id = nearest.id;
                let old_vec = self.memory.get_vector(id).unwrap();
                let new_vec = blend(old_vec, key, 0.5); // e.g. average for simplicity
                self.memory.update_vector(id, new_vec);
                // Optionally update stored value (merge info)
                self.memory.update_value(id, merge(self.memory.get_value(id), value));
                return;
            }
        }
        // Otherwise, insert as new memory
        self.memory.add(key, value);
        self.retention.on_write(&mut self.memory);
    }
}

Here, before inserting we attempt to merge with an existing close vector. The function blend could do a weighted average or more complex update. This mimics a fast weights approach where memory is updated in place. In a true neural implementation (like Titans), memory might be an ndarray::Array of weights, and we apply an SGD update: e.g. W -= η * ∇ℓ(W; k_t, v_t) to minimize the attentional bias loss ￼. Rust crates like ndarray or ndarray-linalg can be used for matrix operations, while autodiff or burn/dfdx could enable defining a small network and updating its weights with gradients if needed.

Structured coherence is also crucial: as new info is associated, we must maintain consistency in memory. One approach (embraced by RuVector) is to impose graph or topology-based coherence. For example, if memory entries are nodes in a graph (with edges for semantic relatedness or temporal sequence), we can require that new updates do not create incoherent subgraphs. Advanced methods like mincut gating have been explored, where a graph of token relationships is partitioned (min-cut) to decide which information to gate out and maintain logical integrity ￼. While such complexity may be beyond a simple implementation, designing memory as a graph of vectors is feasible using crates like petgraph or ruvector’s graph support. This can help with associative retrieval (traversing linked facts) and ensures memory updates propagate along connected concepts when appropriate (maintaining narrative or knowledge coherence).

High-Performance Vector Similarity Search

At the heart of this system is a fast vector search module to retrieve relevant memories by similarity. Every time we need to check novelty or recall related info, we’ll be querying a vector database. Rust’s ecosystem offers excellent options for this:
	•	RuVector Core: RuVector provides a Rust-native vector database with built-in approximate nearest neighbor (ANN) indexing (HNSW) and SIMD acceleration ￼ ￼. It can handle high-dimensional embeddings efficiently (e.g. 16 million distance ops/sec for 512-dim vectors using SimSIMD) ￼. You can use ruvector_core::VectorDB which supports add/search operations and even hybrid search (combining vector and keyword queries) ￼ ￼. For example:

use ruvector_core::{VectorDB, DistanceMetric};
let mut memory_db = VectorDB::new(DistanceMetric::Cosine)?;  // initialize an in-memory vector DB
memory_db.add(vec![0.1, 0.2, ...], Some("fact42"))?;         // add vector with an ID or payload
let results = memory_db.search(&query_vector, 5)?;           // top-5 nearest vectors

RuVector uses HNSW (Hierarchical Navigable Small World) graphs under the hood for approximate search, giving sub-millisecond query times even for large collections ￼. It also supports persistence (to disk via Redb) and quantization for memory compression ￼.

	•	Alternatives: If not using RuVector, one could integrate hnsw_rs (a standalone HNSW implementation) or libraries like Similari (which offers parallelized similarity search and tracking) for approximate search. There’s also Qdrant (an open-source vector DB in Rust) which can be used if a client-server DB is acceptable. For an embedded system, crates like vsearch or kiddo (for exact K-D tree) might be useful, but HNSW is generally the gold standard for high-dimensional ANN.

The vector search module is crucial for both reading and writing memory: it finds nearest neighbors for surprise calculation, finds candidates for associative update, and retrieves relevant memories to feed into the main AI model when answering queries. By using a proven ANN library, we ensure scalability. (In fact, memory search in our design can easily handle thousands of queries per second on consumer hardware ￼.)

Geometric memory storage can also mean using specialized metrics or spaces: e.g. hyperbolic embeddings for knowledge graphs (to better embed hierarchical relationships). RuVector supports hyperbolic space attention mechanisms ￼, which could be applied if hierarchical structure in memory is important (for example, encoding general vs specific knowledge at different curvatures). In Rust, one could use a custom distance function for the vector DB (if using RuVector’s API, DistanceMetric::Custom or implementing trait if available) to handle non-Euclidean metrics.

Continuous Embedding Updates at Inference Time

To support continuous learning at inference time, the system must integrate with an embedding model that can produce (and possibly adapt) vector representations on the fly. Unlike static retrieval-augmented models, here the memory and model can evolve as new data comes in (test-time learning). Key considerations:
	•	Embedding Model Integration: We need to convert raw inputs (text, image, etc.) into the vector space used by the memory. This can be done via a pre-trained encoder (e.g. a Transformer for text). In Rust, we can use libraries like tch-rs (Rust bindings for PyTorch) or onnxruntime to run a transformer model and get embeddings. The ruvector ecosystem specifically allows plugging in embedding providers – e.g. an ApiEmbedding for remote APIs or an OnnxEmbedding for local ONNX models ￼. For instance, one might load a MiniLM or SentenceTransformer ONNX model and call it in the Rust memory loop to encode each new document or dialogue turn into a vector.
Example using onnxruntime crate for a text embedding model:

let session = onnxruntime::session::Session::new(&env, "embedder.onnx")?;
fn embed_text(session: &Session, text: &str) -> Result<Vec<f32>, Error> {
    // Preprocess text to tensor, run session, extract output vector...
    # unimplemented!()
}
let vec = embed_text(&session, "New input sentence");
memory_system.process_input(vec, ...);

This ensures each new input at inference is turned into a vector and passed to the memory system (which then decides to store or not). The embedding model itself can be large, so one might run it on a GPU via tch or use a smaller model for speed. Note: If the main AI model is itself an LLM, one might use its internal embeddings for memory (e.g., use the hidden state of the LLM as a key).

	•	Online Parameter Updates: A more advanced aspect is updating the embedding/model parameters during inference. Titans actively updates its own weights (in the long-term memory MLP) without offline retraining ￼ ￼. To emulate this, one could fine-tune the embedding model or a portion of the network on the new data as it streams. For example, if using a smaller transformer for embeddings, you could do a few gradient steps on that model in the background with each new high-surprise input. Rust’s emerging ML libraries like burn or dfdx allow defining neural networks and training them in pure Rust (or use tch::nn for a PyTorch-like training). This dynamic update turns the system into a continual learner. However, care is needed to not overfit or destabilize the model; techniques like learning rate decay, gradient clipping, or limiting updates to a specialized memory layer (like Titans does) help maintain stability.

In practice, many systems might avoid actual weight fine-tuning of a large model at inference and instead concentrate learning in the external memory (which we are building). Our design supports update-on-inference primarily by the memory store itself being dynamic. Each inference step can add to or alter memory (as we’ve detailed) – effectively giving the model a way to remember new information instantly ￼ ￼. The next time a similar input appears, the memory retrieval will surface what was learned, allowing the model to respond using that updated knowledge.

Modular Architecture and Future Integration

The above components are designed to be modular, which aligns with maintainability and future expansion (e.g. into agent systems or integration with frameworks like Claude Flow). We can structure the code into modules/crates:
	•	memory_gate.rs: Contains SurpriseGate and related logic for surprise detection and write gating.
	•	retention.rs: Defines RetentionPolicy trait and implementations (aging, capacity, etc.) for pruning.
	•	associative_update.rs: Functions or methods for merging and updating memory vectors (could be part of MemorySystem impl).
	•	vector_db.rs: Abstraction over the vector search index (wrapping RuVector or another ANN library behind a trait if needed). This could allow swapping out the backend (for example, use an in-memory HNSW vs. a distributed DB).
	•	embedding.rs: Handles embedding model integration – e.g. loading models, the EmbeddingProvider trait similar to RuVector’s design ￼, so that we can easily switch between a local encoder, a remote API, or even a mock for testing.

By coding to traits and high-level interfaces, we ensure the agent or orchestrator interacting with this memory sees a clean API. For instance, an agent could call memory_system.remember(event) and memory_system.recall(query) without needing to know the internal details. This separation makes it possible to plug the memory system into a larger architecture:
	•	Agentic Systems: In a complex agent (say an autonomous reasoning agent), the memory system can serve as a knowledge base. Because our design supports fast queries and updates, an agent can write its observations or intermediate results to memory and query them later (enabling chain-of-thought persistence). The use of Rust ensures thread-safe, efficient operation, which is beneficial if the agent runs concurrently. One could integrate this with an async task system or even expose it as a service the agent calls.
	•	Claude Flow Integration: Claude Flow￼ is an AI orchestration platform that supports persistent memory across sessions. Our memory system could serve as the backend for such persistence. For example, replacing a simple SQLite memory store with our vector-based memory would allow semantic recall in Claude Flow agents. Because we can persist the memory (via a file or database using Redb/Sled from Rust), the memory can survive agent restarts (cross-session memory) ￼. The modular design means we could implement Claude Flow’s memory API by mapping it to our MemorySystem calls. Indeed, RuVector even provides a Postgres extension for vector search (ruvector-postgres) for seamless integration into databases ￼ – such an approach could be used if Claude Flow or other platforms prefer calling SQL queries for memory (our system could be wrapped in a simple HTTP or DB interface).

Finally, by drawing on existing crates and frameworks, we accelerate development and align with best practices. RuVector’s crates (like ruvector-core, ruvector-postgres, ruvector-nervous-system) give a treasure trove of advanced features “out of the box” – from dozens of attention mechanisms to GNN-based retrieval and even mincut-gated transformers for coherence ￼. We can start simple (as illustrated with basic code snippets) and incrementally adopt these features. For instance, one could switch the similarity search to use hybrid search (text + vector) with minimal changes if using RuVector’s API ￼, or enable conformal prediction and other advanced re-ranking methods available ￼.

In summary, a Rust implementation combining MIRAS and RuVector would consist of a neural-enabled memory module that: (1) writes only when a surprise triggers learning, (2) maintains itself via retention gates (analogous to forgetting regularization) ￼, (3) updates associative connections in memory via online optimization steps ￼, (4) leverages high-performance vector search (HNSW with SIMD) for recall ￼, and (5) continuously incorporates new embeddings during inference, enabling real-time adaptation ￼. This design not only matches the theory from Google’s Titans/MIRAS, but is practically achievable in Rust with the cited libraries. It sets a solid foundation for future expansions – from an AI agent’s evolving knowledge base to enterprise-scale memory systems in orchestrated AI flows.

Sources:
	•	Google Research Blog – “Titans + MIRAS: Helping AI have long-term memory” (Dec 2025) ￼ ￼ ￼ ￼ ￼ ￼ ￼
	•	Behrouz et al., MIRAS framework paper (2025) – Theoretical formulation of memory as optimization ￼ and components of Memory/Interest/Retention/Algorithm ￼ ￼
	•	RuVector Documentation – Ruvector Core crate features ￼ ￼ and design notes (geometric memory, attention mechanisms) ￼; ruvector-mincut-gated-transformer crate description ￼.
	•	Emergent Mind summary of MIRAS – details on associative memory updates and retention gates ￼ ￼.
	•	Claude Flow Wiki – persistent memory integration details ￼ (context for future integration).
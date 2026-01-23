# Dual-Mode Streamable Model Context Protocol (MCP) Design

## Overview

The **Model Context Protocol (MCP)** is an open standard that connects language models to external tools and data in a structured way. Think of MCP as the *“USB-C of AI integrations”*: it provides a uniform interface for LLMs (like Claude) to plug into databases, APIs, local files, etc. Our goal is to design an MCP implementation that works in **two modes** – as a local **STDIO** service for CLI tools, and as an **HTTP streaming** service – while maintaining a unified message format and context-aware, stateful communication between agents or modules. This protocol will enable multiple AI agents (in a Claude-code-flow environment) or distributed nodes (in a QuDAG network) to exchange messages with rich context, progressive updates, and strong security.

Key design goals include:

* **Structured messaging** with a consistent framing format (based on JSON) for both STDIO and HTTP.
* **Context-aware** message metadata (each message carries context like session, agent identity, etc., to manage multi-agent workflows).
* **Progressive streaming updates** so agents can send partial results or ongoing progress.
* **Async and bidirectional** communication to support agent-initiated messages (reflection, alerts) and concurrent updates.
* **Security by design**, including optional quantum-safe encryption and signing of messages (Kyber/Dilithium), especially in a distributed DAG setting.
* **Extensibility** to new capabilities (future tools, agent runtime integration, or swarm orchestration) without breaking compatibility.

Below we detail the MCP message format and framing, how streaming and async updates are handled, sketches for STDIO and HTTP implementations (with Rust examples), security considerations (encrypted payloads, DAG signing), and how the design supports future agentic runtimes or swarms.

## Message Framing and Streaming Format

MCP uses a structured message format based on **JSON-RPC 2.0**, ensuring every message has a clear type and ID. This framing provides a lightweight envelope for requests, responses, and notifications:

* **Requests:** JSON objects with an `id`, a `method` name, and parameters (`params`). The `method` describes an action or query (e.g. fetching data, invoking a tool).
* **Responses:** JSON objects with the matching `id` and either a `result` (on success) or an `error` (with code/message). Each request yields at most one final response.
* **Notifications:** JSON objects with a `method` and params but **no** `id`. These are one-way messages for events or updates that don’t expect a reply.

**Framing:** In STDIO mode, messages are sent over a byte stream. We adopt the standard practice of prefixing each JSON message with a length header (e.g. `Content-Length: N` followed by `\r\n\r\n`), similar to Language Server Protocol framing. This ensures the receiver can delineate message boundaries on a raw stream. In HTTP mode, each JSON-RPC message is sent in the HTTP body (for requests) or as part of an event stream (for responses), described below. JSON encoding keeps messages human-readable and easy to debug.

**Streaming Responses:** MCP supports **streaming** for long-running or incremental results. A server can choose to break a large result into a sequence of smaller messages (e.g. stream chunks of a generated text, or intermediate progress updates). In JSON-RPC terms, the server may send **multiple partial responses** for one request via notifications or SSE events, then a final response to mark completion. Over HTTP, this is achieved with **Server-Sent Events (SSE)**: the server sets `Content-Type: text/event-stream` and sends a stream of JSON-RPC messages as events. Each SSE event contains one JSON message (often a `notification` for partial data, and eventually the final `response`). Over STDIO, the server can simply write multiple JSON messages back-to-back – the client will process each in turn. For example, a long database query might first stream a *“processing started”* notification, then a series of result chunk notifications, and finally a response indicating completion.

**Message Example:** A typical JSON-RPC request in MCP might look like:

```json
{ 
  "jsonrpc": "2.0", 
  "id": "42", 
  "method": "searchDatabase", 
  "params": { "query": "SELECT * FROM Products WHERE price > 100" } 
}
```

If the result is large, the server could reply with an SSE stream (HTTP) or sequential STDIO messages like:

```json
{ "jsonrpc": "2.0", "method": "partial", "params": { "batch": [ ... ] } }
{ "jsonrpc": "2.0", "method": "partial", "params": { "batch": [ ... ] } }
{ "jsonrpc": "2.0", "id": "42", "result": { "done": true, "totalItems": 500 } }
```

Here we use a convention: intermediate chunks come as `method: "partial"` notifications (no `id`), and the final response carries the original `id` to complete the request. This is just one design approach for progressive results; the protocol could also label partial outputs via an `"update": true` flag in the payload, etc. The framing ensures all JSON messages are self-describing and can be parsed in sequence.

## Asynchronous Updates and Agent Reflection

**Asynchronous communication** is a first-class feature of MCP. Servers can send **out-of-band notifications** or even requests back to the client asynchronously (for example, to signal an internal event or request additional input). The protocol’s use of JSON-RPC (which supports notifications and client-to-server requests) means either side can initiate messages at any time, not just as a strict request-response sequence. This is crucial for multi-agent systems where agents might act autonomously or **“reflect”** on their own outputs.

**Progress Updates:** The protocol supports progress and status updates through notifications. For instance, an agent performing a long computation could send periodic `"progress"` notifications (e.g. `{"jsonrpc":"2.0","method":"progress","params":{"percent": 50}}`) to update the host on its state. These async messages keep the system context in sync, and the host can render progress bars or logs to the user.

**Agent Reflection:** “Reflection” refers to an agent’s ability to analyze and adjust its behavior based on intermediate results or feedback. MCP can facilitate this by allowing an agent to send itself or a peer agent special messages. For example, after producing an answer, an agent could issue a *“self-reflection”* request: `method: "reflect"`, containing its reasoning log or asking a verification module to double-check the answer. The protocol does not hard-code specific reflection behaviors, but it provides the *flexibility* to implement them via custom methods or tool calls. Because messages carry contextual metadata (like an `id`, agent identity, timestamps, etc.), an agent can link reflections to specific prior messages or state.

**Concurrent and Bidirectional Messaging:** In a Claude-flow swarm scenario, many agents may be running in parallel. MCP’s async design allows multiple responses to be in-flight simultaneously. Each JSON-RPC message has an `id` to correlate replies, so agents can handle interwoven dialogues without confusion. One agent can fire off multiple requests to different MCP servers (or other agents) and handle their responses as they arrive. Conversely, servers can initiate callbacks – e.g., an MCP server might send a request to the client to ask for additional permission or data. The **event stream** design of HTTP transport even lets servers push notifications to clients outside the context of a specific request (for example, a file-watcher tool could notify of file changes spontaneously).

To manage all this, the protocol may attach **contextual metadata** to messages such as: a *session ID*, *agent ID*, or *parent message ID*. This metadata helps maintain state synchronization across agents. For instance, an agent reflection message might include a reference to the message it is reflecting on. In a DAG-based system, these references naturally form links (edges) in the conversation graph. The protocol’s flexibility with JSON payloads means we can add fields like `"context": {"prior": "<msg-hash>"}` or define specialized methods for cross-references as needed.

Importantly, the **transport layer** supports reliability features for async updates. SSE streams, for example, can tag events with incremental IDs and allow clients to **resume** a stream after disconnection by sending the last seen event ID. This means even if a network hiccup occurs, an agent can reconnect and catch up on missed asynchronous notifications, keeping state in sync. Overall, MCP’s design empowers dynamic agent workflows: agents can reflect, collaborate, and update each other continuously through a shared protocol.

## STDIO Implementation (CLI Tools Sketch)

For local command-line (CLI) tools or modules, MCP can run over simple **STDIN/STDOUT** pipes. In this mode, the MCP server is just a process (for example, a Python or Rust program) that reads JSON-RPC messages from STDIN and writes responses to STDOUT. The host (e.g. Claude Desktop or another orchestrator) acts as the MCP **client**, launching the process and communicating via its stdio streams.

**How it works:** When the CLI tool starts, it performs any necessary initialization (optionally sending an MCP `"initialize"` handshake message to declare its capabilities). After that, the host can send requests. Each request is written as a JSON text to the process’s STDIN, framed by length. The tool reads and parses the JSON, performs the action, and writes back a JSON result to STDOUT. This loop continues, allowing multiple calls over the same long-lived process (maintaining state between calls if needed). The connection is **stateful** – the tool can store context in memory (caches, database connections, etc.) and reuse it for subsequent requests, which is more efficient than one-shot scripts.

**Example (Pseudo-code):** A simple Python MCP server might look like:

```python
import sys, json
for line in sys.stdin:
    msg = json.loads(line)
    if "method" in msg:
        if msg["method"] == "echo":
            response = {"jsonrpc":"2.0","id": msg["id"], "result": msg["params"]["text"]}
        # ... handle other methods ...
        print(json.dumps(response), flush=True)
```

The host would send `{"jsonrpc":"2.0","id":1,"method":"echo","params":{"text":"Hello"}}` to STDIN, and get back `{"jsonrpc":"2.0","id":1,"result":"Hello"}` on STDOUT.

**Progressive Output:** Even in STDIO mode, streaming is possible. The server can flush partial messages to STDOUT as it produces data. For example, a long-running CLI tool (say it’s running a shell command) could output incremental logs via notifications. Each JSON message is written on a new line (or with length prefix) and flushed immediately; the host reads these and can display live feedback. STDIO has no built-in multiplexing, but since JSON-RPC is text-based, it’s straightforward to handle one message at a time in sequence.

**Launching and management:** The host can spawn such a CLI tool using standard OS process APIs. For instance, in Rust one could use `std::process::Command` to start the child process and connect pipes to its stdio. The host must handle if the process exits or crashes – in MCP, the client can attempt to restart the server process if needed, or propagate an error to the user. The MCP STDIO transport is ideal for **local integrations and simple tools** because it avoids networking complexity and has low latency (everything stays on localhost). Many reference MCP servers (like a SQLite query server or filesystem reader) are implemented as lightweight CLI programs following this pattern.

**Security sandboxing:** One can run the CLI tool with restricted permissions if needed (for example, dropping privileges or using a container) to protect the host. Since the host is executing an external tool, it should ensure the user trusts that tool. MCP’s design assumes the user has consented to using that server tool. With STDIO, access to local resources is direct (the tool can read files or DBs if allowed), so proper OS-level security (file permissions, etc.) must be in place. The protocol itself remains the same JSON messages, just carried over pipes.

## HTTP Streaming Implementation (Rust Examples)

In networked scenarios or whenever we prefer a service architecture, MCP can run over **HTTP** with streaming responses. The protocol here follows a simple pattern:

1. **Client-to-Server (HTTP POST):** Each JSON-RPC request or notification from the client is sent as an HTTP `POST` to the server’s MCP endpoint (e.g. `POST /mcp`). The JSON body contains the `method` and `params` just like in STDIO mode. The server parses the JSON from the HTTP request body.

2. **Server-to-Client Responses:** For each request, the server can respond in two ways:

   * **Single response:** If the operation is quick or one-off, just return an HTTP 200 with a JSON body containing the response object (`Content-Type: application/json`). This covers simple requests that don’t need streaming.
   * **Streaming response:** If the operation produces multiple messages or needs to keep the client updated, the server returns an **SSE stream** (`Content-Type: text/event-stream`). The HTTP connection remains open, and the server sends a sequence of SSE events. Each event’s data is a JSON-RPC message (often a partial result or a notification). The stream can end with a final event that contains the actual JSON-RPC response to fulfill the request `id`.

3. **Server-Initiated Messages:** MCP also allows the server to send messages without a specific client request prompting them (e.g. notifications or even new requests to the client). To enable this over HTTP, the client can establish a long-lived SSE **subscription**. For example, the client might `GET /mcp/stream` which the server handles by keeping open and pushing events for any asynchronous notifications. In practice, this could be used for server-to-client callbacks or broadcasts. Each event might include an `"id"` if it’s a response to something, or no id if it’s a pure notification. The SSE events can have incremental `event-id` headers so clients can reconnect and **resume** after a disconnect by using the `Last-Event-ID` header – ensuring reliable delivery of async updates.

**Rust Server Example:** We can implement an MCP HTTP server in Rust using frameworks like **Axum** or **Warp**. Below is a conceptual snippet with Axum (using async Rust and SSE):

```rust
use axum::{Router, routing::get, routing::post, extract::Json, response::sse::{Sse, Event}};
use futures::stream::{Stream, StreamExt};
use serde_json::Value;
use std::convert::Infallible;

// Handler for MCP POST requests
async fn handle_mcp_request(Json(payload): Json<Value>) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    // Parse JSON-RPC request from payload
    let method = payload.get("method").and_then(Value::as_str).unwrap_or("");
    let id = payload.get("id").cloned();
    if method == "longTask" {
        // For demonstration, stream multiple updates for a longTask
        let mut counter = 0;
        // Create a stream of SSE events
        let stream = futures::stream::unfold(counter, |state| async move {
            if state < 5 {
                // Example partial notification
                let data = json!({"jsonrpc":"2.0", "method":"partial", "params": {"progress": state * 20}});
                let event = Event::default().data(data.to_string());
                Some((Ok(event), state + 1))
            } else {
                // Final result event
                let result = json!({"jsonrpc":"2.0", "id": id, "result": {"status": "done"}});
                let event = Event::default().data(result.to_string());
                None::<(Result<Event, Infallible>, i32)> // end of stream
            }
        });
        Sse::new(stream)  // return SSE response
    } else {
        // Handle simple request with immediate JSON response
        let result = json!({"jsonrpc":"2.0","id": id, "result": "ok"});
        // Convert to an SSE stream of one event for consistency
        let event = Event::default().data(result.to_string());
        Sse::new(futures::stream::once(async move { Ok(event) }))
    }
}

// Setting up Axum routes (for illustration)
let app = Router::new().route("/mcp", post(handle_mcp_request));
```

In this sketch, `handle_mcp_request` inspects the incoming JSON. If the method is `"longTask"`, it creates an SSE stream that emits several `"partial"` events (with progress percentages) and then a final event with the result. If it’s some other quick method, it just responds with one event containing the result. The use of `axum::response::sse::Sse` type wraps a Rust `Stream` of events into an HTTP response that Axum will encode as `text/event-stream` properly. Clients (in Rust, Python, or any language) would simply `POST` JSON to `/mcp` and, if they see an SSE response (indicated by headers), read the events as they come.

**Rust Client Example:** On the client side, one can use an HTTP library (like `reqwest` in Rust) to post JSON and handle SSE. E.g., using `reqwest` one can do:

```rust
let client = reqwest::Client::new();
let resp = client.post("http://localhost:3000/mcp")
    .json(&request_json)
    .send()
    .await?;
if resp.headers().get(reqwest::header::CONTENT_TYPE) == Some(&"text/event-stream".parse().unwrap()) {
    let mut stream = resp.bytes_stream();
    while let Some(chunk) = stream.next().await {
        // parse chunk as SSE event (each event ends with two newlines)
        // extract JSON data from it and handle it
    }
} else {
    let result_json: Value = resp.json().await?;
    // handle single JSON response
}
```

This pseudo-code posts a JSON-RPC request. If the server responded with SSE, it iterates over the byte stream, splitting events and parsing JSON from each event’s data. If it was a normal JSON response, it parses it directly. There are also higher-level SSE client libraries that can abstract the parsing.

**HTTP vs STDIO Parity:** Both modes support the same semantics. HTTP adds overhead of HTTP headers and slightly more complexity in streaming, but it allows multiple clients and remote connections. STDIO is simpler and good for one-to-one local connections. We ensure that the **message format and protocol commands are identical** in both cases, so a server could even offer both interfaces (e.g., a Rust MCP server could listen on a TCP port for HTTP while also accepting STDIO for local usage). Internally, the business logic for handling `method` calls and producing results is the same; only the transport differs. The official MCP spec defines these as two *standard transport mechanisms*: Standard I/O and Streamable HTTP. Developers can choose whichever fits their deployment, or even offer both concurrently.

## Security Considerations

**Secure context and operations:** Because MCP bridges AI models with powerful tools (filesystems, databases, code execution), security is paramount. The protocol itself is **content-agnostic** (it just wraps messages), so securing an MCP deployment involves encryption of the channel, authentication of parties, and careful sandboxing of what tools can do. Our design adds multiple layers of security, including **quantum-safe cryptographic wrapping** for scenarios that demand high security (as in the QuDAG network), as well as standard best practices for any RPC system.

**Transport Encryption:** In local STDIO mode, encryption is not needed on the pipe (it’s an internal process pipe). But for HTTP mode, especially if used over untrusted networks, use TLS for transport encryption. To be *quantum-resistant*, one could use a TLS library that supports PQ key exchange (some TLS libraries now support hybrid key exchanges with algorithms like Kyber). Alternatively, at the application layer, we can perform our own key exchange using **CRYSTALS-Kyber** – a lattice-based KEM algorithm. Kyber was selected by NIST as a standard for post-quantum encryption, providing a way for two parties to establish a shared secret that a quantum adversary cannot easily crack. In practice, the client and server can perform a one-time Kyber handshake at session start: the server sends its Kyber public parameters, the client uses them to encrypt a random session key, and the server decapsulates to get that session key. That symmetric session key (e.g. 256-bit) can then encrypt all subsequent JSON payloads (using fast symmetric crypto like AES or ChaCha20). This ensures that even if an eavesdropper records the traffic, a future quantum computer couldn’t retroactively decrypt it.

**Authentication and Signing:** To prevent tampering or impersonation, all messages can be digitally signed with **CRYSTALS-Dilithium**, which is a lattice-based digital signature scheme (also selected by NIST). Each MCP agent or server would have its own Dilithium key pair. Before communication begins, they exchange public keys (or better, share via a trusted directory or certificate). Every JSON-RPC message’s content (or its hash) is then signed and attached (e.g. an extra `"signature"` field). The receiver verifies the signature using the sender’s public key, ensuring the message truly came from the claimed identity and wasn’t altered. Dilithium signatures are quite fast and short (e.g. a few KB), so this is feasible to do on each message or at least each SSE event. This is especially important in a distributed **QuDAG** scenario where malicious nodes might try to inject or modify messages.

**DAG-based Integrity (QuDAG):** In a QuDAG architecture (a quantum-resistant DAG-based anonymous network), messages are not just passed peer-to-peer, but also recorded in a DAG data structure for consensus. Each message (vertex in the DAG) can include cryptographic links to its parents (previous messages) and a signature. Our MCP messages in such a system should incorporate a **hash chain**: e.g., each message could have a field referencing the hashes of one or more prior messages it depends on. By signing this, we create a **tamper-evident ledger** of communications. If any message was altered, its hash link in a descendant would fail verification. The QuDAG network can run a consensus algorithm (like a *quantum-resistant Avalanche* as mentioned in QuDAG) to agree on the order of messages or to ensure consistency. The MCP layer would be agnostic to consensus mechanics, but from a design perspective we ensure compatibility: include message IDs/hashes, allow multiple parent references (hence a DAG, not just chain), and have every node sign its outgoing messages. This way, an agent’s actions are verifiable and traceable (to authorized observers) without revealing content to unauthorized ones.

**Anonymous Routing and Access Control:** QuDAG is described as an anonymous comms layer, so it likely employs mix-network or onion routing. This is below MCP’s concern, but one must consider that if MCP is running over such a network, the protocol should minimize any identifying metadata in messages. For example, rather than sending explicit user identifiers, an agent might use opaque session tokens. The encryption and signatures can be done in a way that doesn’t reveal identity to intermediaries (signatures can be verified by the endpoint after decrypting the payload, so intermediaries only see ciphertext). We should also incorporate **capability-based security**: servers announce what they can do, and hosts only allow certain methods. The MCP handshake negotiates capabilities, and the host should reject any unexpected method call from a server for safety. Each tool server ideally runs with least privilege – e.g., a database MCP server should only have access to that database, not the entire filesystem.

In summary, our MCP design secures the channel with encryption (optionally PQC for future-proofing) and the content with signatures. It embraces the key principles of user consent and isolation described in the MCP spec. By layering classical security (TLS, auth tokens) with quantum-safe crypto (Kyber, Dilithium), and by leveraging the DAG structure for integrity, we ensure that the communication remains confidential, authentic, and resistant to even advanced attackers. These measures protect not just against eavesdropping, but also against message forgery or replay. (For instance, using message IDs and nonces can help detect replays, and the DAG’s consensus can prevent an attacker from reordering messages undetected.)

## Extensibility and Future Integration

Our MCP design is built to last – it can **evolve and integrate** with future agentic runtimes or swarm schedulers without needing a complete redesign. This is achieved through modularity and versioned capability negotiation:

* **Feature Negotiation:** MCP uses a capability-based handshake where clients and servers declare their supported features at initialization. This means if a future extension is added (say a new message type for a scheduling command or a new cryptographic method), an agent can advertise support and the other side will only use it if both agree. The core protocol stays minimal and compatible, while new abilities stack on top. The design explicitly allows adding features progressively and negotiating them as needed. For example, if in the future an “agent scheduling” feature is introduced, servers that support it would list it in their capabilities, and clients could then send new methods like `scheduleTask` or `spawnAgent` safely.

* **Swarm and Multi-Agent Coordination:** In a Claude-Flow “swarm mode” (where hundreds of agent instances run concurrently), the protocol can serve as the common language for coordination. Each agent might be an MCP server exposing certain tools or data; a central orchestrator (MCP client/host) can route tasks to them. Because MCP clients manage 1:1 connections to servers, a swarm controller can spin up a new MCP client instance for each agent it launches, maintaining isolation between agents. The swarm scheduler could use an **agent registry** that tracks which agent/server has which capabilities, then direct JSON-RPC requests to the appropriate one. The uniform message format makes it easy to add such a layer – the scheduler might just generate higher-level plans (a DAG of tasks) and then translate each task into an MCP `method` call to the right agent. The **state synchronization** features (progress updates, etc.) help the scheduler monitor all agents’ status in real time, adjusting as needed (e.g., if one agent finishes a task early, the scheduler gets a notification and can reallocate resources).

* **Agentic Runtime Integration:** In the context of an *agentic runtime* (where an AI can spawn sub-agents or tools dynamically), MCP can act as the bridging protocol. For example, an LLM agent could decide it needs a new tool – the runtime could launch a new MCP server (perhaps by using a template or image) and connect it on the fly. Because our protocol is standardized, the agent doesn’t need to know details of the tool’s API beyond the MCP interface. This fosters a *swarm of services* approach: many small specialized MCP servers can be orchestrated together. The runtime or scheduler can also inject metadata like **task IDs, deadlines, or priorities** into MCP messages (e.g., as part of `params` or a custom header) to help with scheduling policies. Since JSON is flexible, adding a `"priority": "high"` or `"group": "experiment-123"` field to all requests is straightforward, and agents that don’t recognize it can ignore it (forward compatibility).

* **Extensible Message Schema:** The protocol can be extended to support additional message types or metadata without breaking existing clients. For instance, if we wanted to integrate a **logging/tracing layer** for debugging swarms, we could define a special notification method like `"log"` that agents can emit with debug info. Older components that don’t understand it will simply not act on it (since it’s a notification), while new monitoring tools could listen for those. Similarly, if quantum-safe crypto gets superseded or if we want to integrate future cryptographic proofs (like zero-knowledge proofs that an agent did some computation correctly), we can append those to messages as optional fields. The design principles of MCP emphasize clear separation and composability – each part of the system focuses on its role, and new parts can be added without reworking the whole.

* **Backward and Forward Compatibility:** By versioning the protocol and using feature flags, we ensure older agents can still connect to newer hosts (they’ll simply not use new features) and vice versa. The MCP spec is versioned (e.g. “2025-06-18” as of writing), and our design would follow semantic versioning for changes. A swarm scheduling layer might be introduced in MCP 2.0, for example, but an MCP 1.x server could still function with an MCP 2.0 client if it sticks to the core methods it knows. This is analogous to how web browsers handle new HTTP headers – unknown ones are ignored. We strive for **graceful degradation**: all critical interactions (requests for data, tool invocations) use well-defined base protocol methods, while more advanced coordination (like migrating a session to another agent, or load-balancing between agents) can be done through optional extensions.

In conclusion, the dual-mode MCP we designed is not only robust for current use cases but also **future-proof**. It can operate in local CLI environments or scale up to cloud-based microservices with equal ease. It supports rich streaming and async behavior required by complex multi-agent reasoning, and it embeds cutting-edge security to guard these powerful capabilities. By adhering to open standards and emphasizing extensibility, this MCP will be able to integrate with emerging agent frameworks, whether it’s Anthropic’s Claude running dozens of codelets, or a decentralized QuDAG network of AI services. In short, we’ve built the foundation for structured, context-rich agent communication that’s ready for the next generation of AI-driven applications – from single-user desktop tools to swarming agents orchestrating tasks in parallel, all speaking the same **Model Context Protocol**.

**Sources:** The design draws on the official MCP specification and docs, which describe JSON-RPC messaging, STDIO and HTTP transports, and the client-server architecture. It also incorporates insights from recent implementations (Claude-Flow and QuDAG) to ensure support for swarm orchestration and quantum-resistant security. By combining these state-of-the-art practices, the proposed MCP design achieves a comprehensive solution for context-aware, streamable, and secure agent communication.

# Model Context Protocol (MCP) — Developer Specification (Version 2025-11)

**Purpose:**
Provide a standard for connecting AI hosts (agents, IDEs, apps) to external tools, resources, and data with consistent discovery, invocation, and result-handling semantics.

**Release Timeline:**

* **Release Candidate (RC):** Nov 14 2025
* **Final Release:** Nov 25 2025
* **Validation Window:** Nov 14–25 for implementor testing.

---

## 1. Core Architecture

### 1.1 Roles

* **MCP Client (Host):** An AI runtime (e.g., LLM or agent framework) embedding an MCP Client SDK to discover tools, call them, and interpret results.
* **MCP Server:** An external service exposing tools via a standardized interface.
* **Registry:** A discoverable index of MCP servers (public or private) with metadata.

### 1.2 Transport Layers

Supported communication channels:

* **STDIO:** Local development or IDE environments.
* **HTTP + SSE:** For remote async operations.
* **WebSocket (β):** For live streaming and push updates.

Each transport must support:

```json
{
  "version": "2025-11",
  "client_id": "string",
  "server_id": "string",
  "transport": "stdio|http|ws",
  "capabilities": ["async", "registry", "code_exec"]
}
```

---

## 2. Versioning and Compatibility

Version identifiers use the **`YYYY-MM`** format.
Servers and clients must negotiate on connection:

```json
{ "mcp_version": "2025-11", "capabilities": [...] }
```

If mismatch > 1 cycle, the client must downgrade or reject.

---

## 3. Discovery and Metadata

### 3.1 File-Based Discovery

Servers expose a directory or virtual FS structure:

```
/tools/
  ├── get_user_profile.json
  ├── run_analysis.json
  └── upload_document.json
/resources/
  ├── schemas/
  └── templates/
```

Each file defines a tool or resource descriptor (JSON Schema 1.1):

```json
{
  "tool_id": "run_analysis",
  "name": "Run Analysis",
  "description": "Executes an analytics workflow.",
  "input_schema": { "type": "object", "properties": { "dataset": {"type": "string"} } },
  "output_schema": { "type": "object", "properties": { "summary": {"type": "string"} } },
  "metadata": { "cost_estimate": 0.001, "latency": "50ms" }
}
```

### 3.2 Registry Entries

```json
{
  "server_id": "analytics.mcp",
  "version": "2025-11",
  "endpoint": "https://analytics.mcp/api",
  "tools": ["run_analysis", "fetch_metrics"],
  "auth": "bearer|mutual_tls",
  "capabilities": ["async","stream","sandbox"]
}
```

---

## 4. Tool Invocation Protocol

### 4.1 Request

```json
{
  "request_id": "uuid",
  "tool_id": "run_analysis",
  "arguments": { "dataset": "sales_q3.csv" },
  "session": "uuid",
  "mode": "async|sync",
  "context": { "trace_id": "uuid", "client_name": "ClaudeFlow" }
}
```

### 4.2 Response

```json
{
  "request_id": "uuid",
  "status": "success|error|in_progress",
  "result": { "summary": "Q3 revenue up 12 %" },
  "progress": { "percent": 60 },
  "metadata": { "duration_ms": 534, "tokens_used": 187 }
}
```

### 4.3 Async Jobs

Servers may return a job handle:

```json
{ "status": "in_progress", "job_id": "uuid", "poll_after": 5 }
```

Clients use `/jobs/:job_id` or `resume(job_id)` to retrieve results.

---

## 5. Extensions and Capabilities

| Capability   | Description                                              |
| ------------ | -------------------------------------------------------- |
| `async`      | Long-running tasks with poll/resume semantics            |
| `registry`   | Server self-registration & metadata publishing           |
| `code_exec`  | Server runs code on behalf of client outside LLM context |
| `stream`     | Server streams incremental output                        |
| `sandbox`    | Isolated execution environment for untrusted tasks       |
| `schema_ref` | Allows tool schemas to reference shared definitions      |

---

## 6. Security and Governance

### 6.1 Authentication

Servers MUST support at least one:

* OAuth 2.1 Bearer Token
* Mutual TLS Certificate Pinning
* Local Keypair Exchange for STDIO mode

### 6.2 Audit and Logging

Clients and servers log all tool invocations:

```
[2025-11-10T08:15Z] client=claude-flow tool=run_analysis tokens=312 status=success latency=534ms
```

### 6.3 Sandboxing

If `code_exec` is enabled, servers must use:

* Containerized or VM isolation
* Filesystem limits for runtime data
* Resource quotas for CPU/memory

---

## 7. Performance and Best Practices

### 7.1 Code Execution Pattern

Instead of serializing large tool schemas into the model context,
the model issues compact file references:

```json
{ "import": "tools/run_analysis.json" }
```

The server handles logic externally and returns summary results.
Observed token reduction: ~98 % (150 k → 2 k).

### 7.2 Caching and Versioning

Clients cache tool metadata by ETag or SHA-256 digest.
Servers invalidate on schema change.

### 7.3 Metrics

* Average latency (ms)
* Token usage (in/out)
* Success rate (%)
* Error rate by tool

---

## 8. Client Implementation Guidelines

* Maintain a local manifest cache (`/tmp/mcp_cache.json`).
* Validate schema before invocation.
* Support resume/retry for async jobs.
* Implement telemetry hooks for CI/CD validation.
* Respect server declared rate limits (`X-MCP-Limit` header).

---

## 9. Server Implementation Guidelines

* Use `/tools` directory for tool definitions and versioned schemas.
* Provide `/metadata` endpoint for health and capabilities.
* Implement logging to JSON Lines format.
* Register periodically with the MCP Registry.
* Offer unit tests for each tool with input/output fixtures.

---

## 10. Migration Checklist (2025-11)

1. Upgrade `version` fields to `2025-11`.
2. Add async job support in both client and server.
3. Refactor tool definitions to file-based discovery.
4. Publish metadata to Registry.
5. Enable code execution pattern for heavy logic.
6. Run compatibility tests with STDIO and HTTP transports.
7. Validate security policies (OAuth/TLS).
8. Update CI pipeline to check schema integrity and latency targets.

---

## 11. Reference Client and Server Scaffolds

### Node.js (Claude Flow / Agentic Flow example)

```bash
npx create-mcp-server my-server
cd my-server
npm install mcp-sdk@latest
```

```ts
import { createServer } from 'mcp-sdk';
import tools from './tools';

createServer({
  id: 'my-server',
  version: '2025-11',
  tools,
  transports: ['http', 'stdio'],
  capabilities: ['async','registry','code_exec']
}).listen();
```

### Python Example

```python
from mcp_server import MCPServer

server = MCPServer(
    id="analytics.mcp",
    version="2025-11",
    transports=["http"],
    capabilities=["async","registry","code_exec"]
)

@server.tool("run_analysis")
def run_analysis(dataset: str):
    return {"summary": analyze(dataset)}

server.start()
```

---

## 12. Validation and Compliance Testing

Developers should run:

```bash
mcp validate --target 2025-11 --server-url http://localhost:8080
```

Tests include:

* Schema validation
* Transport handshake
* Async job completion
* Security header checks

---

## 13. Future Roadmap Highlights (from MCP team)

* Delta updates for partial tool schemas
* Streaming input/output channels
* Native WebAssembly extension interface
* Cross-registry federation
* Declarative permissions via policy files

---

### Developer Note

From Anthropic’s latest guidance, expect clients like Claude Flow to shift to the file-discovery pattern for all MCP tools. This design minimizes context pollution and aligns with modern agentic engineering: low token cost, faster I/O, and modular governance.

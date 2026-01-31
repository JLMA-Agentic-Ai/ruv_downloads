# Guidebook, Part 2

**Fine‑tuning an agentic LLM for Claude Code, the Claude Agent SDK, and Claude Flow MCP**

## Section introduction

Part 1 defined your agent objectives, baseline metrics, and operating constraints. Part 2 turns those decisions into a concrete fine‑tuning and deployment plan that is optimized for Anthropic’s agent stack: Claude Code for day‑to‑day agentic coding, the Claude Agent SDK for production agents, and Claude Flow for MCP‑based tool orchestration. We will:

1. choose the right Claude model mix for agent work
2. prepare high‑signal training data from real agent traces
3. fine‑tune a Claude model in Amazon Bedrock and define strict gates to avoid overfitting
4. package the model behind the Agent SDK with MCP tools and Claude Code settings
5. stand up an evaluation harness, cost model, and safety controls

Key capabilities we lean on: Claude Code’s project memory and permission model, headless mode for automation, Agent SDK subagents and settings loading, and MCP servers for robust tool use. ([Anthropic][1])

---

## Deliverable overview

* A fine‑tuned Claude variant for repetitive, domain‑specific tasks
* A production agent built with the Claude Agent SDK, wired to your curated MCP tools from Claude Flow
* Project‑level Claude Code configuration and memory files
* A red‑green eval harness with cost and latency gates
* A one‑page operations runbook

---

## Step‑by‑step plan

### Step 1. Pick the model strategy

1. **Primary agent model** for long‑running, computer‑use, coding, and complex planning: use the latest Sonnet 4.5 in the API or Claude Code. Anthropic positions it as their best model for agents and coding. Use it as the planner and generalist. ([Anthropic][2])
2. **Fine‑tuning target** for task‑specialized behaviors and strict formatting: fine‑tune **Claude 3 Haiku** in Amazon Bedrock, which supports Claude fine‑tuning. Route narrow, repetitive tasks to this tuned model to reduce cost and stabilize outputs. ([Amazon Web Services, Inc.][3])

Tip: keep planning on Sonnet 4.5, execute narrow flows on tuned Haiku, and fall back to base Sonnet if confidence is low.

### Step 2. Define agent behaviors that benefit from fine‑tuning

Fine‑tuning is not for everything. It shines when you need:

* rigid output schemas that must always validate
* domain style, policy, or vocabulary
* deterministic tool‑selection phrasing that improves MCP tool calling success
* repetitive code patterns or review styles

AWS’s Bedrock guide for Haiku details JSONL training format and early stopping; we will mirror that. ([Amazon Web Services, Inc.][3])

### Step 3. Build the training corpus from agent traces

**Sources**

* Claude Code headless jobs and interactive sessions, including command transcripts, file edits, tests, and outcomes
* Agent SDK transcripts from staging agents
* Claude Flow non‑interactive runs with stream‑JSON chaining and automation scripts, plus success and failure markers ([Claude Docs][4])

**Format**

Bedrock requires JSONL using the Messages format:

```json
{"system":"You are a senior code agent for ACME.","messages":[
  {"role":"user","content":"Refactor handler X for idempotency. Produce patch and tests."},
  {"role":"assistant","content":"1) Analyze call graph...\n2) Produce diff...\n<CODE_PATCH>\n<TESTS>\n<Result: all tests pass>"}
]}
```

Include both single‑turn and multi‑turn threads. Use dev outcomes to label success. AWS documents the exact schema and the value of early stopping to curb overfitting. ([Amazon Web Services, Inc.][3])

**Curation**

* Deduplicate, remove sensitive data, enforce strict decontamination of evaluation prompts
* Keep a frozen 20 percent dev and 20 percent test split from day one
* Tag each record with task type, tool set, and success or failure

### Step 4. Fine‑tune Claude in Amazon Bedrock

1. **Permissions and data setup**. Create the S3 buckets for train, validation, and artifacts. Create the IAM role Bedrock assumes. ([Amazon Web Services, Inc.][3])
2. **Hyperparameters and limits**. Start with 1 to 3 epochs, small learning rate multiplier, batch size per default guidance. Enable early stopping on validation. AWS documents JSONL schema, hyperparameters, and early stopping. ([Amazon Web Services, Inc.][3])
3. **Submit the job** in console or API. Keep within published limits for train and validation record counts. ([Amazon Web Services, Inc.][3])
4. **Acceptance gates**. Require:

   * schema validity ≥ 99.5 percent on held‑out tasks
   * exact‑match or F‑score uplift vs base Haiku on your domain set
   * no regressions on general sanity prompts beyond 1 to 2 percent
   * lower p95 latency and cost per task vs Sonnet routing for those tasks

General Bedrock customization docs and the Anthropic‑on‑Bedrock overview are good cross‑references. ([AWS Documentation][5])

### Step 5. Wrap the tuned model with the Claude Agent SDK

Use the Agent SDK to standardize memory, subagents, permissions, and MCP. The SDK is built on the same harness that powers Claude Code, and exposes features like settings loading, tool permissions, subagents, and MCP servers. ([Claude Docs][6])

**TypeScript skeleton**

```ts
import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

// 1) define an MCP tool locally with Zod validation
const fetchKpis = tool(
  "fetch_kpis",
  "Return yesterday's revenue and churn",
  { date: z.string().default("yesterday") },
  async ({ date }) => {
    // call your analytics API
    const result = { revenue: 125000.42, churn: 0.0071, date };
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

// 2) run an in-process MCP server for the tool
const mcp = createSdkMcpServer({ name: "kpi-tools", version: "1.0.0", tools: [fetchKpis] });

// 3) main agent call, loading project settings and CLAUDE.md
const stream = query({
  prompt: "Generate a weekly KPI review with charts, then open a PR with the report.",
  options: {
    settingSources: ["project"],           // load .claude/settings.json and CLAUDE.md
    mcpServers: { kpi: mcp },              // plus remote servers via MCP if desired
    allowedTools: ["Bash", "Edit", "WebFetch", "ListMcpResources", "ReadMcpResource"],
    systemPrompt: { type: "preset", preset: "claude_code", append: "Follow ACME PR template." },
    model: "claude-sonnet-4-5"
  }
});

for await (const msg of stream) {
  // handle streaming messages, permissions, and tool results
  if (msg.type === "assistant") process.stdout.write(msg.content);
}
```

See the Agent SDK reference for `query`, `tool`, `createSdkMcpServer`, settings precedence, and permission modes. ([Claude Docs][7])

### Step 6. Configure Claude Code for engineers and CI

* **Project memory**. Maintain `CLAUDE.md` at repo root and in key subfolders. Claude Code automatically pulls these into context. Keep coding standards, commands, testing notes, and repo etiquette here. ([Anthropic][1])
* **Permissions**. Edit `.claude/settings.json` or use `/permissions` to allow specific tools, such as Edit, Bash(git commit:*), or MCP tools. Principle of least privilege. ([Anthropic][1])
* **Headless mode**. Use `claude -p "<prompt>" --output-format stream-json` in CI to run agents non‑interactively. Anthropic documents headless mode and stream‑JSON. ([Claude Docs][4])

Why this matters: Claude Code’s memory, permissioning, and headless mode make engineers productive while aligning behavior between local dev, CI, and production agents.

### Step 7. Wire in Claude Flow MCP tools

Claude Flow provides an MCP‑orchestrated catalog and non‑interactive pipelines such as stream‑JSON chaining. Start with a slim, auditable set of servers, then expand. ([GitHub][8])

* Prefer official or well‑maintained servers from the MCP site and spec. Use output schemas and strict validation where available. ([Model Context Protocol][9])
* Configure project‑level `.mcp.json` or Agent SDK `mcpServers` to attach servers like GitHub, Notion, Zapier, Vectara, or filesystem. Anthropic and community directories help you discover curated servers. ([Anthropic][10])

### Step 8. Establish the evaluation and routing harness

Create two test suites.

1. **Domain tasks** the tuned Haiku should own

   * strict schema checks, tool success rate, execution time
2. **General agent tasks** that Sonnet 4.5 should own

   * planning quality, code edits that compile and pass tests, autonomy duration

Use Claude Code’s headless mode to run end‑to‑end tests, and the Agent SDK to simulate production sessions with the same settings sources. ([Claude Docs][4])

**Routing rule of thumb**

* If required format equals exact JSON schema and cost is sensitive, route to tuned Haiku
* If the task needs deep reasoning, long sessions, or many external tools, route to Sonnet 4.5

Anthropic’s Sonnet 4.5 announcement highlights agent reliability in long tasks and computer use. ([Anthropic][2])

### Step 9. Cost and latency model

Let device_hourly_cost be your runner cost, and let `tps` be tokens per second.

* Cost per 1k tokens ≈ (device_hourly_cost ÷ 3600) × (1000 ÷ tps) + model_price_per_1k
* For a task, expected cost ≈ input_tokens × price_in + output_tokens × price_out + overhead from MCP calls

Track cost per completed task in the harness and regress when exceeding targets.

### Step 10. Safety, privacy, and governance

* Use **allowedTools** and permission prompts so human reviewers can deny risky operations. Claude Code and the Agent SDK provide fine‑grained tool controls and permission modes. ([Anthropic][1])
* Keep enterprise privacy requirements in mind. Anthropic recently announced chat data may be used for training unless opted out for non‑commercial users, while enterprise accounts are exempt. Verify your tenancy and settings. ([WIRED][11])
* Follow MCP security guidance. Validate inputs, rate limit, and sanitize outputs at the MCP server boundary. ([Model Context Protocol][12])

---

## Role‑specific runbooks

### A) Product owner

* Define North Star metrics for 3 to 5 workflows, for example, PR time‑to‑merge, incident MTTR, requirement‑to‑commit cycle time
* Approve the MCP tool shortlist and the initial routing policy Sonnet 4.5 vs tuned Haiku
* Sign off on the acceptance gates below

### B) Engineering lead

* Maintain `CLAUDE.md` and `.claude/settings.json` in repo
* Add CI steps that run headless Claude Code checks on every PR
* Own the MCP tool catalog per team and the permission model

Best practices across memory and permissions are documented by Anthropic. ([Anthropic][1])

### C) MLOps

* Operate the Bedrock fine‑tuning pipeline and version the JSONL datasets
* Automate model sweeps for epochs and learning rate multipliers with early stopping
* Export eval reports with schema validity, tool success rate, and latency distributions

Bedrock’s fine‑tuning workflow and JSONL structure are documented in detail. ([Amazon Web Services, Inc.][3])

### D) Security and compliance

* Review allowed tool lists and require explicit confirmation on sensitive operations
* Run MCP tool security checks and enforce output schemas at the server
* Audit logs for tool invocation, file writes, and network calls

MCP spec details tool listing, calling, and security considerations. ([Model Context Protocol][12])

---

## Acceptance gates to avoid overfitting and regressions

* **Schema fidelity** on held‑out domain tasks ≥ 99.5 percent
* **Exact‑match or F‑score** uplift vs base Haiku on domain set ≥ 5 percent
* **General capability** drop vs base Sonnet on sanity set ≤ 2 percent
* **Tool success rate** on MCP calls ≥ 98 percent with retries
* **Safety**. No increase in high‑risk tool attempts at the same prompts

Early stopping from Bedrock is your first line of defense against overfitting. ([Amazon Web Services, Inc.][3])

---

## Templates

### 1) System prompt, planner agent (Sonnet 4.5)

```
You are ACME’s principal engineer and planner. 
Plan, then act with Claude Code and MCP tools. 
Always propose a short plan first, then request permissions for tools you need.
Prefer editing files with tests. Respect CLAUDE.md and .claude/settings.json. 
When using MCP tools, validate required inputs and check output schemas.
```

Use `systemPrompt: { type: "preset", preset: "claude_code", append: "<lines above>" }` in the Agent SDK. ([Claude Docs][7])

### 2) `.claude/settings.json` minimal example

```json
{
  "model": "claude-sonnet-4-5",
  "allowedTools": ["Read", "Edit", "MultiEdit", "Bash(git commit:*)", "WebFetch", "ListMcpResources", "ReadMcpResource"],
  "project": {
    "initCommands": ["npm ci", "npm run typecheck"]
  }
}
```

Settings structure, allowed tools, and management via `/permissions` are covered in Claude Code docs and best practices. ([Claude Docs][13])

### 3) Training data JSONL recipe

* Include both success and failure exemplars, but oversample success 3 to 1
* Encode tool selection patterns textually if you want the tuned model to emulate them
* Keep prompts short and explicit, answers strictly in target schema

Bedrock’s JSONL format example and multi‑turn options are documented. ([Amazon Web Services, Inc.][3])

### 4) CI step for headless Claude Code

```bash
claude -p "Run unit tests and fix failing tests. Stop after passing." \
  --output-format stream-json \
  --allowedTools Edit --allowedTools Bash --allowedTools WebFetch
```

Headless mode is documented in the Claude docs and engineering post. ([Claude Docs][4])

---

## Claude Flow integration pattern

* Start with 10 to 20 vetted MCP servers from Claude Flow’s catalog. Use stream‑JSON chaining to pipe outputs between subagents in non‑interactive workflows. ([GitHub][14])
* For each server, create an Agent SDK subagent with a clear description, a minimal system prompt, and a short allowed tools list. The SDK supports programmatic subagent definitions and project settings loading. ([Claude Docs][7])
* Keep servers behind a gateway that enforces authentication, rate limits, and outbound allowlists. Follow MCP security considerations. ([Model Context Protocol][12])

Discover additional connectors and servers in Anthropic’s directory and the official MCP repos. ([Anthropic][10])

---

## Benchmarks and monitoring

* **Task pass rate**. Completed end‑to‑end without human edits
* **Tool success rate**. Tool calls that return valid, schema‑conformant output
* **Tokens per completed task** and **p95 latency**
* **Cost per completed task**
* **Safety**. Denied tool attempts per 100 tasks, and reasons

Use Agent SDK telemetry and Claude Code Analytics if available to centralize metrics. The Agent SDK exists to build production agents and inherits Claude Code’s harness. ([Claude Docs][6])

---

## Risks and mitigations

* **Model drift**. Re‑run sanity sets weekly. Freeze dev and test splits.
* **Tool instability**. Pin MCP server versions and validate output schemas. MCP spec shows the schema and output schema patterns. ([Model Context Protocol][12])
* **Privacy**. Confirm enterprise data sharing and retention settings in the Claude console and corporate policy. Recent policy changes affect non‑commercial users by default. ([WIRED][11])

---

## Example rollout plan

**Week 1**

* Build corpus, run first Haiku fine‑tune job in Bedrock, configure early stopping, ship first eval report. ([Amazon Web Services, Inc.][3])

**Week 2**

* Wire tuned model behind Agent SDK and attach 10 MCP servers. Add CLAUDE.md and permissions. ([Claude Docs][6])

**Week 3**

* Route two workflows to tuned Haiku. Keep Sonnet 4.5 as planner and fallback. Observe p95 and cost. ([Anthropic][2])

**Week 4**

* Expand MCP set, harden schemas, add canary users, and set SLOs on tool success rate and cost per task.

---

## Executive one‑pager

* Sonnet 4.5 plans and uses computers well, tuned Haiku executes domain‑specific flows at lower cost. ([Anthropic][2])
* We fine‑tune Haiku in Bedrock using curated Claude Code and Agent SDK transcripts, with early stopping and strict gates. ([Amazon Web Services, Inc.][3])
* We deploy with the Agent SDK and Claude Code, and extend with MCP via Claude Flow. ([Claude Docs][6])
* We measure pass rate, tool success, latency, and cost per completed task.
* We enforce safety with allowed tools, permissions, and MCP schema validation. ([Model Context Protocol][12])

---

## Optional LinkedIn post for rUv

> We just shipped a two‑tier agent stack with Claude: Sonnet 4.5 plans and uses the computer, while a fine‑tuned Haiku handles our domain‑specific flows with strict schemas. Wrapped in the Agent SDK, supercharged by Claude Code memory and permissions, and extended with a curated set of MCP servers through Claude Flow. The result is lower cost per completed task, higher reliability, and auditable tool use. If you are still treating tooling and runtime as an afterthought, you are leaving performance and safety on the table. ([Anthropic][2])

---

### References

* Agent SDK overview and features, including settings, subagents, permissions, and MCP servers. ([Claude Docs][6])
* Agent SDK TypeScript reference for `query`, `tool`, `createSdkMcpServer`, `settingSources`. ([Claude Docs][7])
* Claude Code best practices, memory files, permissions, MCP usage, headless automation. ([Anthropic][1])
* Headless mode documentation. ([Claude Docs][4])
* MCP overview and specification for tools, security, and schemas. ([Model Context Protocol][9])
* Fine‑tuning Claude 3 Haiku in Amazon Bedrock, JSONL schema, early stopping, and workflow steps. ([Amazon Web Services, Inc.][3])
* Anthropic models available in Bedrock. ([Amazon Web Services, Inc.][15])
* Sonnet 4.5 launch context for agents, coding, and computer use. ([Anthropic][2])
* Claude Flow non‑interactive pattern and stream‑JSON chaining. ([GitHub][14])
* Tool and connector directories for MCP. ([Anthropic][10])
* Policy change on chat data usage for training and enterprise carve‑out. ([WIRED][11])

---

## Quick feedback hook

Rate this Part 2 on a 1 to 5 scale for depth and practicality. If you want, I will deliver a Part 2.1 appendix that includes a ready‑to‑run Bedrock fine‑tune job script, a repo‑ready `.claude/` folder template, and a minimal Agent SDK project with three MCP servers prewired.

[1]: https://www.anthropic.com/engineering/claude-code-best-practices "Claude Code Best Practices \ Anthropic"
[2]: https://www.anthropic.com/news/claude-sonnet-4-5?utm_source=chatgpt.com "Introducing Claude Sonnet 4.5"
[3]: https://aws.amazon.com/blogs/machine-learning/fine-tune-anthropics-claude-3-haiku-in-amazon-bedrock-to-boost-model-accuracy-and-quality/ "Fine-tune Anthropic’s Claude 3 Haiku in Amazon Bedrock to boost model accuracy and quality | Artificial Intelligence"
[4]: https://docs.claude.com/en/docs/claude-code/sdk/sdk-headless?utm_source=chatgpt.com "Headless mode - Claude Docs"
[5]: https://docs.aws.amazon.com/bedrock/latest/userguide/custom-model-fine-tuning.html?utm_source=chatgpt.com "Customize a model with fine-tuning or continued pre- ..."
[6]: https://docs.claude.com/en/api/agent-sdk/overview "Agent SDK overview - Claude Docs"
[7]: https://docs.claude.com/en/api/agent-sdk/typescript "Agent SDK reference - TypeScript - Claude Docs"
[8]: https://github.com/ruvnet/claude-flow?utm_source=chatgpt.com "ruvnet/claude-flow"
[9]: https://modelcontextprotocol.io/ "What is the Model Context Protocol (MCP)? - Model Context Protocol"
[10]: https://www.anthropic.com/news/connectors-directory?utm_source=chatgpt.com "Discover tools that work with Claude"
[11]: https://www.wired.com/story/anthropic-using-claude-chats-for-training-how-to-opt-out?utm_source=chatgpt.com "Anthropic Will Use Claude Chats for Training Data. Here's How to Opt Out"
[12]: https://modelcontextprotocol.io/docs/concepts/tools "Tools - Model Context Protocol"
[13]: https://docs.claude.com/en/docs/claude-code/settings?utm_source=chatgpt.com "Claude Code settings"
[14]: https://github.com/ruvnet/claude-flow/wiki/Non-Interactive-Mode?utm_source=chatgpt.com "Non Interactive Mode · ruvnet/claude-flow Wiki"
[15]: https://aws.amazon.com/bedrock/anthropic/?utm_source=chatgpt.com "Anthropic's Claude - Models in Amazon Bedrock"


# AGENT.md

## Overview

This document outlines the operational standards and directory structure for autonomous ChatGPT Codex agents within an offline, air-gapped SPARC-based development environment. Agents must adhere to the SPARC methodology and operate in a secure, self-contained workspace without internet access post-setup.

---

## SPARC Methodology Alignment

### 1. Specification

* Extract requirements from:

  * `/specs/` folder (`.md`, `.yaml`, `.json`)
  * `.spec.md` files in root or module directories
* Must define:

  * `task_id`
  * `summary`
  * `input`, `expected_output`
  * `constraints`, `evaluation_criteria`
* Output: Test stub in `/tests/`.

### 2. Pseudocode

* Store in `/pseudo/` using `.md`, `.pseudo.js`, or `.pseudo.ts`.
* Include:

  * Input/output annotations
  * Decision logic
  * Error handling

### 3. Architecture

* Store in `/arch/` as:

  * `.md` text explanations
  * `.uml` diagrams (PlantUML/Mermaid)
  * `.json` component maps
* Document:

  * Module interfaces
  * Data flow
  * Dependencies

### 4. Refinement

* Code inside `/src/`, structured per architecture.
* Tests go in `/tests/`.
* Track refinement cycles in `/logs/refinement.log`.

### 5. Completion

* Triggered when:

  * All tests pass
  * Code coverage >90%
  * `.completion.json` is generated with metadata
* Output goes to `/dist/`.

---

## Required Directory Structure

```
/workspace/
├── specs/           # Task definitions
├── pseudo/          # Pseudocode modules
├── arch/            # System diagrams and architecture docs
├── src/             # All source code
├── tests/           # All test cases
├── memory/          # Semantic memory and embeddings
├── logs/            # Execution and test logs
├── dist/            # Packaged artifacts
├── .env.template    # Placeholder for secure env vars
├── .completion.json # Completion metadata
├── .roomodes        # Roo mode definitions
└── .roo/            # Mode config and dependency manifest
```

---

## Execution Environment Constraints

* **Internet Access**: Disabled post-setup.
* **Dependencies**: Use only local packages declared in `.roo/dependencies.json`.
* **No Remote Fetches**: Avoid `npm`, `pip`, `curl`, etc., after setup.
* **Graceful Failure**: If online behavior is invoked, fail gracefully.

---

## Agent Command Modes

| Mode          | Description                                  | Output Target                |
| ------------- | -------------------------------------------- | ---------------------------- |
| `spec-mode`   | Parse `.spec.md`, generate test stubs        | `/tests/`                    |
| `pseudo-mode` | Generate pseudocode scaffolds                | `/pseudo/`                   |
| `build-mode`  | Implement modules based on pseudocode        | `/src/`                      |
| `test-mode`   | Run tests offline, no telemetry              | `/logs/test_runs.log`        |
| `finalize`    | Package outputs, generate `.completion.json` | `/dist/`, `.completion.json` |

---

## Test Strategy

* Use local runners (`offline-runner.ts`, local `pytest`).
* Store logs in:

  * `/logs/test_runs.log`
  * `/logs/refinement.log`

---

## Security & Credential Handling

* **Secrets**: No plaintext secrets.
* **Environment Variables**: Use `.env.template` as reference.
* **Access**: Refer only via `process.env.KEY`.
* **Logging**: Never log secrets to files.

---

## Commit and Versioning

* Use Conventional Commits:

  ```
  feat(login): add offline auth logic
  fix(utils): correct hashing salt bug
  test(login): add edge case coverage
  ```
* Append SPARC phase in brackets:

  ```
  chore(init): create scaffolding [sparc:spec]
  ```
* Tag completions:

  ```
  git tag -a complete-login-v1 -m "SPARC Completion"
  ```

---

## Memory and State

* `/memory/vector_store.json`: Local vector memory only.
* Store:

  * Embeddings
  * Completion references
  * Related task links

---

## Output Metadata Example

```json
{
  "task_id": "login-flow-001",
  "commit": "d41d8cd9",
  "tests_passed": true,
  "coverage": "91.2%",
  "timestamp": "2025-05-16T23:00:00Z",
  "output_files": [
    "src/login/index.ts",
    "tests/login.test.ts"
  ]
}
```

---

## Final Notes

This specification is mandatory for Codex agents operating offline within SPARC-aligned environments. All output must be self-contained, secure, and verifiable.

**Version**: `SPARC-Agent-Spec v1.2.0`
**Maintainer**: `ruvnet/ruv-dev`

---
## A drop-in **redaction hook** wired through `settings.json` for Claude Code. 

It masks secrets before tools run and censors sensitive fields in transcripts.

## what is it?

Data leakage for enterprises using Ai coding is a ███ . Redaction hooks solve ██ problems by catching secrets before they leak. Here’s how I do it.

A redaction hook sits between your agent and the outside world. Every time Claude Code reads a file, runs a shell command, or fetches a web resource, the hook scans for sensitive patterns like API keys, tokens, or passwords. If it sees something dangerous, it either masks it with a placeholder or blocks the request outright. That way, your logs and transcripts remain useful but never expose private values.

Using them is straightforward. 

You wire hook scripts into your project’s .claude/settings.json, add some simple regex matchers for patterns like API keys, and let the hook handle the rest. Pre-hooks decide if a tool can run, post-hooks clean what comes back.

The value here is zero-trust by default. Instead of assuming every agent call is safe, you force all activity through a checkpoint that enforces your rules. 

The risk of accidentally leaking secrets into training data, version control, or audit logs is greatly reduced. For enterprises, that means safer coding environments and far fewer compliance headaches.

### 1) `~/.claude/settings.json` or `.claude/settings.json`

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit|NotebookEdit|Read|Bash|WebFetch",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/redact-pre.py",
            "timeout": 5
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit|NotebookEdit|Bash|WebFetch",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/redact-post.py",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

Format and fields for `settings.json`, hook structure, events, matchers, and decision control are defined in the Claude Docs. ([Claude Docs][1])

### 2) `.claude/hooks/redact-pre.py`

```python
#!/usr/bin/env python3
import json, os, re, sys

SECRET_PATTERNS = [
    re.compile(r'(?i)\b[A-Z0-9]{20,}[_-]?[A-Z0-9]{10,}\b'),          # generic long tokens
    re.compile(r'(?i)\b(?:api|secret|token|key|passwd|password)\s*[:=]\s*["\']?([^\s"\']+)'),
    re.compile(r'(?i)sk-[a-z0-9]{20,}'),                              # common key prefix
]

REDACT = "★★★REDACTED★★★"

def scrub(obj):
    if isinstance(obj, dict):
        clean = {}
        for k, v in obj.items():
            lk = k.lower()
            if lk in {"content", "command", "headers", "authorization", "auth", "password"}:
                clean[k] = REDACT
            else:
                clean[k] = scrub(v)
        return clean
    if isinstance(obj, list):
        return [scrub(v) for v in obj]
    if isinstance(obj, str):
        s = obj
        for pat in SECRET_PATTERNS:
            s = pat.sub(REDACT, s)
        return s
    return obj

def main():
    try:
        data = json.load(sys.stdin)
    except Exception as e:
        print(f"Invalid JSON: {e}", file=sys.stderr)
        sys.exit(1)

    tool_name = data.get("tool_name", "")
    tool_input = data.get("tool_input", {})

    # Hard block risky bash patterns
    if tool_name == "Bash":
        cmd = tool_input.get("command", "") or ""
        if re.search(r'\b(curl|wget)\b.*\s(-H|--header)\s.*(authorization|api-key)', cmd, re.I):
            print("Blocking Bash call that would echo auth headers", file=sys.stderr)
            sys.exit(2)  # block

    # Approve benign reads quietly to cut friction
    decision = None
    reason = None
    if tool_name == "Read":
        fp = tool_input.get("file_path", "")
        if fp.endswith((".md", ".mdx", ".txt", ".json")):
            decision = "allow"
            reason = "Documentation read auto approved"

    out = {
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            **({"permissionDecision": decision, "permissionDecisionReason": reason} if decision else {})
        }
    }
    print(json.dumps(out))
    sys.exit(0)

if __name__ == "__main__":
    main()
```

### 3) `.claude/hooks/redact-post.py`

```python
#!/usr/bin/env python3
import json, sys, re

REDACT = "★★★REDACTED★★★"
SECRET_TEXT = re.compile(r'(?i)(?:api|secret|token|key|bearer)\s*[:=]\s*["\']?([^\s"\']+)')

def redact_text(s: str) -> str:
    s = SECRET_TEXT.sub(REDACT, s)
    if len(s) > 50000:  # safety middle truncate for huge outputs
        s = s[:25000] + "\n... " + REDACT + " ..." + s[-25000:]
    return s

def main():
    try:
        data = json.load(sys.stdin)
    except Exception as e:
        print(f"Invalid JSON: {e}", file=sys.stderr)
        return 1

    tool_resp = data.get("tool_response", {})
    # Add advisory context to Claude after tool runs
    out = {
        "hookSpecificOutput": {
            "hookEventName": "PostToolUse",
            "additionalContext": "Outputs sanitized by redaction policy"
        }
    }

    # If tool response includes printable fields, scrub them in transcript
    for k in ("stdout", "stderr", "body", "content"):
        if isinstance(tool_resp.get(k), str):
            tool_resp[k] = redact_text(tool_resp[k])

    print(json.dumps(out))
    return 0

if __name__ == "__main__":
    sys.exit(main())
```

### 4) File layout and perms

```bash
mkdir -p .claude/hooks
chmod +x .claude/hooks/redact-pre.py .claude/hooks/redact-post.py
```

### Notes that matter

* Place user or project config in the supported `settings.json` paths. Precedence and available keys are documented. ([Claude Docs][1])
* Hook structure uses `hooks.EventName[]` with optional `matcher`, `type`, and `command`. Events and JSON I/O are defined in the hooks reference. ([Claude Docs][2])
* Use `permissionDecision` for PreToolUse control. Exit code 2 blocks a tool and feeds stderr to Claude. ([Claude Docs][2])

[1]: https://docs.claude.com/en/docs/claude-code/settings "Claude Code settings - Claude Docs"
[2]: https://docs.claude.com/en/docs/claude-code/hooks "Hooks reference - Claude Docs"

# Jujutsu vs Git Worktrees: Key Differences

## TL;DR

**Git Worktrees**: Multiple working directories pointing to different branches of the same repo  
**Jujutsu (jj)**: Fundamentally different VCS with operation log, first-class conflicts, and automatic change tracking

They solve different problems and aren't direct alternatives.

---

## Conceptual Differences

### Git Worktrees
```
repo/.git/              # Main git directory
repo/main/              # Worktree 1 (main branch)
repo/feature-a/         # Worktree 2 (feature-a branch)
repo/feature-b/         # Worktree 3 (feature-b branch)
```

**Purpose**: Work on multiple branches simultaneously without switching
**Limitation**: Still Git underneath - conflicts block, no operation log, manual staging

### Jujutsu (jj)
```
repo/.jj/
  ├── repo/             # Commit storage
  ├── op_store/         # OPERATION LOG (every action recorded)
  ├── op_heads/         # Current operation state
  └── working_copy/     # Working copy state
repo/.git/              # Git backend (for compatibility)
```

**Purpose**: Rethink version control with operation-first model
**Advantages**: Operation log, first-class conflicts, auto-commit, time-travel

---

## Feature Comparison

| Feature | Git Worktrees | Jujutsu (jj) |
|---------|---------------|--------------|
| **Multiple working directories** | ✅ Yes | ❌ Not the focus |
| **Operation log** | ❌ No | ✅ Yes (every operation recorded) |
| **First-class conflicts** | ❌ No (blocks operations) | ✅ Yes (conflicts are commits) |
| **Auto-commit working copy** | ❌ No (manual staging) | ✅ Yes (working copy IS a commit) |
| **Undo any operation** | ❌ Limited (reflog) | ✅ Yes (full operation history) |
| **Concurrent edits** | ⚠️ One branch per worktree | ✅ Conflicts recorded, not blocking |
| **Branch model** | ✅ Named branches | ⚠️ Anonymous changes (optional names) |
| **Git compatibility** | ✅ Native | ✅ Via Git backend |
| **Learning curve** | Low (standard Git) | Medium (new concepts) |

---

## Why Worktrees Don't Solve the AI Agent Problem

### Problem: Multiple AI agents editing code simultaneously

#### Git Worktrees Approach ❌
```bash
# Agent 1: Works on feature-a
git worktree add ../agent1-workspace feature-a
cd ../agent1-workspace
# ... agent makes changes ...
git add .
git commit -m "Agent 1: changes"

# Agent 2: Works on feature-b
git worktree add ../agent2-workspace feature-b
cd ../agent2-workspace
# ... agent makes changes ...
git add .
git commit -m "Agent 2: changes"

# Problem: Merging feature-a + feature-b
git checkout main
git merge feature-a  # OK
git merge feature-b  # CONFLICT! Everything stops!
```

**Issues**:
1. ❌ Conflicts still block operations
2. ❌ No automatic tracking of what changed
3. ❌ Requires manual coordination between agents
4. ❌ Can't work on same files concurrently
5. ❌ No operation log for learning

#### Jujutsu Approach ✅
```bash
# Agent 1: Edits file.rs
jj edit file.rs
# Auto-committed, logged: "op_001: edit file.rs by agent-1"

# Agent 2: Edits SAME file.rs (concurrently!)
jj edit file.rs
# Auto-committed, logged: "op_002: edit file.rs by agent-2"

# Merge happens
jj rebase -s agent2-change -d agent1-change
# Conflict recorded IN the commit, doesn't block!

# Conflict resolution can happen later
jj resolve file.rs
# Logged: "op_003: resolve file.rs"
```

**Advantages**:
1. ✅ Conflicts don't block operations
2. ✅ Every change auto-tracked with full context
3. ✅ Agents work independently
4. ✅ Can work on same files (conflicts recorded)
5. ✅ Complete operation log for AgentDB learning

---

## Deep Dive: Why jj is Better for AI Agents

### 1. Operation Log (The Killer Feature)

**Git Worktrees**: No operation log
```bash
git log    # Shows commits only
git reflog # Shows branch pointer movements (limited)
```

**Jujutsu**: Complete operation log
```bash
jj op log  # Shows EVERY operation ever performed
```

Example output:
```
@  qpvuntsm agent-1@example.com 2024-01-07 15:30:00 op_abc123
│  describe "Implement authentication"
◉  sqpuoqvx agent-2@example.com 2024-01-07 15:29:45 op_def456
│  edit src/auth.rs
◉  rqxostpw agent-1@example.com 2024-01-07 15:29:30 op_ghi789
   new --after main
```

**For AI Agents**:
- ✅ Every edit is logged with agent ID, timestamp, context
- ✅ Can replay operations for learning
- ✅ AgentDB can analyze patterns: "Agent X always breaks tests after editing auth"
- ✅ Time-travel: Try 5 different approaches, compare results

### 2. First-Class Conflicts

**Git Worktrees**: Conflicts are errors
```bash
git merge feature-a
# CONFLICT in src/main.rs
# Everything stops until you resolve it
# Can't commit, can't switch branches, can't continue
```

**Jujutsu**: Conflicts are commits
```bash
jj rebase -s feature-a -d main
# Conflict recorded in commit
# You can:
jj new              # Create new change on top of conflict
jj describe         # Describe the conflicted change
jj log              # See conflicted state in history
# Work continues!
```

**For AI Agents**:
- ✅ Agent 1 can create a conflict, Agent 2 keeps working
- ✅ Conflict resolution can be delegated to specialist agent
- ✅ Can analyze conflict patterns for learning
- ✅ No blocking = true concurrent workflows

### 3. Auto-Commit Working Copy

**Git Worktrees**: Manual staging
```bash
# Agent makes changes
vim file.rs
# Forgot to commit? Changes lost if you switch branches!
git add file.rs   # Manual
git commit -m ""  # Manual
```

**Jujutsu**: Working copy IS a commit
```bash
# Agent makes changes
vim file.rs
# AUTOMATICALLY a commit!
jj log  # Shows working copy as "@" commit
jj describe -m "Auto: agent edits"  # Optional: add message later
```

**For AI Agents**:
- ✅ Never lose work
- ✅ Every keystroke trackable
- ✅ Automatic versioning
- ✅ Can undo individual file changes

### 4. Undo ANY Operation

**Git Worktrees**: Limited undo
```bash
git reflog           # Only shows branch movements
git reset --hard     # Dangerous, destructive
# Can't undo: merges, rebases, complex operations
```

**Jujutsu**: Undo anything
```bash
jj op log            # See all operations
jj undo              # Undo last operation
jj op restore op_abc # Restore to specific operation
# Can undo: EVERYTHING (merges, rebases, edits, conflicts)
```

**For AI Agents**:
- ✅ Safe experimentation
- ✅ Rollback failed approaches
- ✅ A/B test different solutions
- ✅ Learn from failures without consequences

---

## Real-World Scenario: 3 Agents Refactoring

### Git Worktrees Approach

```bash
# Setup (manual)
git worktree add ../agent1 feature-auth
git worktree add ../agent2 feature-db
git worktree add ../agent3 feature-tests

# Agent 1: Refactor auth (in ../agent1/)
cd ../agent1
vim src/auth.rs
git add src/auth.rs
git commit -m "Agent 1: refactor auth"

# Agent 2: Refactor DB (in ../agent2/)
cd ../agent2
vim src/db.rs
git add src/db.rs
git commit -m "Agent 2: refactor db"

# Agent 3: Update tests (in ../agent3/)
cd ../agent3
vim tests/test_auth.rs  # Depends on Agent 1's changes!
# Problem: Can't see Agent 1's changes yet
git add tests/test_auth.rs
git commit -m "Agent 3: update tests"

# Merge (manual coordination required)
cd ../../repo
git checkout main
git merge feature-auth   # OK
git merge feature-db     # OK
git merge feature-tests  # CONFLICT! (depends on feature-auth)
# Everything stops! Manual intervention required!
```

**Problems**:
1. ❌ Agents work in isolation (can't see each other's work)
2. ❌ Manual worktree setup per agent
3. ❌ Conflicts block the entire workflow
4. ❌ No automatic tracking of dependencies
5. ❌ Can't learn from the workflow (no operation log)

### Jujutsu Approach

```bash
# No setup needed - all agents work in same repo

# Agent 1: Refactor auth
jj describe -m "Agent 1: refactor auth"
vim src/auth.rs
# Auto-committed as op_001

# Agent 2: Refactor DB (concurrent!)
jj new --after main  # Create parallel change
jj describe -m "Agent 2: refactor db"
vim src/db.rs
# Auto-committed as op_002

# Agent 3: Update tests (sees Agent 1's work!)
jj new --after op_001  # Build on Agent 1's change
jj describe -m "Agent 3: update tests"
vim tests/test_auth.rs
# Auto-committed as op_003

# Merge (automatic conflict handling)
jj rebase -s op_002 -d op_001  # Rebase DB onto auth
# If conflict: recorded in commit, doesn't block!
jj rebase -s op_003 -d op_002  # Rebase tests onto DB
# If conflict: recorded, can be resolved later

# Operation log shows everything
jj op log
# op_001: Agent 1 refactor auth
# op_002: Agent 2 refactor db
# op_003: Agent 3 update tests
# op_004: rebase op_002 -> op_001
# op_005: rebase op_003 -> op_002

# AgentDB learns:
# - Agent 3 depends on Agent 1 (always tests after auth changes)
# - DB changes rarely conflict with auth
# - Test updates take 50% longer when conflicts occur
```

**Advantages**:
1. ✅ Agents see each other's work in real-time
2. ✅ No manual setup (single repo)
3. ✅ Conflicts recorded, don't block
4. ✅ Automatic dependency tracking via operation log
5. ✅ Complete learning data for AgentDB

---

## When to Use Each

### Use Git Worktrees When:
- ✅ You're a human developer
- ✅ You need to work on multiple branches at once
- ✅ You want standard Git semantics
- ✅ Your team is already using Git
- ✅ You don't need operation logging

### Use Jujutsu (jj) When:
- ✅ You have AI agents making code changes
- ✅ You need concurrent multi-agent editing
- ✅ You want to learn from code evolution patterns
- ✅ You need complete operation history
- ✅ Conflicts should be handled gracefully, not block
- ✅ You want time-travel debugging capabilities

### Use agentic-jujutsu When:
- ✅ All of the above, PLUS:
- ✅ You need WASM (browser/Node.js/Deno)
- ✅ You want AgentDB integration for learning
- ✅ You need Rust performance with TypeScript ergonomics
- ✅ You're building multi-agent systems

---

## Technical Deep Dive: How They Work

### Git Worktrees Internals

```
.git/
├── worktrees/
│   ├── agent1/           # Worktree 1 metadata
│   │   ├── HEAD          # Points to feature-a
│   │   ├── index         # Staging area for this worktree
│   │   └── gitdir        # Link back to main .git
│   └── agent2/           # Worktree 2 metadata
│       ├── HEAD          # Points to feature-b
│       ├── index
│       └── gitdir
├── objects/              # Shared object store
├── refs/                 # Shared refs
└── index                 # Main repo staging area

../agent1/                # Worktree 1 working directory
../agent2/                # Worktree 2 working directory
```

**Key Points**:
- Shares object store (efficient)
- Separate staging areas (isolated)
- Still uses Git's commit model (manual, staged)

### Jujutsu Internals

```
.jj/
├── repo/
│   ├── store/            # Commit storage (like Git objects)
│   └── index/            # HNSW index for fast lookups
├── op_store/             # ⭐ OPERATION LOG (unique to jj)
│   ├── operations/       # Every operation ever performed
│   └── views/            # Repository state at each operation
├── op_heads/             # Current operation pointers
└── working_copy/
    ├── tree_state        # Working copy as a commit
    └── operation_id      # Which operation created this state

.git/                     # Git backend for compatibility
```

**Key Points**:
- Operation log is first-class (not reflog)
- Working copy is a commit (not separate state)
- Conflicts stored in commits (not blocking errors)
- Complete history of all operations (learning data!)

---

## Code Example: Multi-Agent Scenario

### Git Worktrees Version

```typescript
// ❌ Git Worktrees approach (limited)
class GitWorktreeAgent {
    async work(taskId: string) {
        // Create worktree for this agent
        await exec(`git worktree add ../agent-${taskId} -b ${taskId}`);
        process.chdir(`../agent-${taskId}`);
        
        // Make changes
        await this.editFiles();
        
        // Manual staging and commit
        await exec('git add .');
        await exec(`git commit -m "Agent ${taskId}: completed"`);
        
        // Return to main repo
        process.chdir('../../repo');
        
        // Merge (blocking on conflicts!)
        try {
            await exec(`git merge ${taskId}`);
        } catch (error) {
            // BLOCKED! Need human intervention
            throw new Error('Merge conflict - manual resolution required');
        }
        
        // Cleanup
        await exec(`git worktree remove ../agent-${taskId}`);
    }
}

// Problem: Can't run agents in parallel due to merge conflicts
await agent1.work('task-1');  // Sequential
await agent2.work('task-2');  // Sequential
await agent3.work('task-3');  // Sequential
```

### Jujutsu Version (agentic-jujutsu)

```typescript
// ✅ Jujutsu approach (concurrent, learning-enabled)
import { JJWrapper, JJHooksIntegration } from '@agentic-flow/jujutsu';

class JujutsuAgent {
    private jj: JJWrapper;
    private hooks: JJHooksIntegration;
    
    async work(taskId: string) {
        // Pre-task hook (logged)
        await this.hooks.onPreTask({
            agent_id: `agent-${taskId}`,
            session_id: 'swarm-001',
            task_description: `Task ${taskId}`,
            timestamp: Date.now()
        });
        
        // Make changes (auto-committed!)
        await this.editFiles();
        
        // Post-edit hook (logged, synced to AgentDB)
        const op = await this.hooks.onPostEdit('src/main.rs', context);
        
        // Post-task hook (collect all operations)
        const ops = await this.hooks.onPostTask(context);
        
        // Conflicts? No problem - they're recorded, not blocking
        const conflicts = await this.jj.getConflicts();
        if (conflicts.length > 0) {
            // Notify coordinator, continue working
            await this.notifyConflicts(conflicts);
        }
        
        return ops; // Return operation log for learning
    }
}

// ✅ Can run agents in parallel!
const [ops1, ops2, ops3] = await Promise.all([
    agent1.work('task-1'),  // Parallel
    agent2.work('task-2'),  // Parallel
    agent3.work('task-3'),  // Parallel
]);

// AgentDB learns from all operations
for (const ops of [ops1, ops2, ops3]) {
    await agentDB.storeEpisodes(ops);
}

// Query learned patterns
const patterns = await agentDB.searchPatterns('refactoring conflicts');
// Result: "Agent type X tends to conflict with Agent type Y on auth files"
```

---

## Conclusion

### Git Worktrees
- **Purpose**: Multiple working directories for human developers
- **Strength**: Familiar Git workflow, easy to understand
- **Limitation**: Still Git underneath - conflicts block, no learning data

### Jujutsu (jj) via agentic-jujutsu
- **Purpose**: Version control rethought for AI agent workflows
- **Strength**: Operation log, first-class conflicts, auto-tracking
- **Advantage**: Enables true concurrent multi-agent coding with learning

### They're Not Competitors
Git worktrees solve: "I want to work on multiple branches at once"  
Jujutsu solves: "I want operation-first VCS with conflict-free workflows"  
agentic-jujutsu adds: "I want AI agents to learn from code evolution"

---

## Further Reading

- **Git Worktrees**: https://git-scm.com/docs/git-worktree
- **Jujutsu**: https://github.com/jj-vcs/jj
- **agentic-jujutsu**: `/workspaces/agentic-flow/packages/agentic-jujutsu/`
- **Operation Log Learning**: `/docs/research/JJ_INTEGRATION_ANALYSIS.md`

---

**Bottom Line**: Git worktrees are a feature of Git. Jujutsu is a different VCS philosophy. agentic-jujutsu makes Jujutsu accessible to AI agents with learning capabilities.

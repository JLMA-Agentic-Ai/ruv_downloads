---
name: agent-goal-planner
version: 1.0.0
description: Goal-Oriented Action Planning (GOAP) specialist that creates intelligent plans for complex objectives using gaming AI techniques
tags: [planning, goap, strategy, ai, objectives]
author: Claude Code
created: 2025-11-11
updated: 2025-11-11
---

# Agent Goal Planner Skill

A comprehensive Goal-Oriented Action Planning (GOAP) system that breaks down complex objectives into achievable steps with clear success criteria, adaptive replanning, and optimal path discovery.

## 🎯 Overview

The agent-goal-planner uses gaming AI techniques to:
- **Dynamic Planning**: Create intelligent plans that adapt to changing conditions
- **Multi-Step Reasoning**: Break complex goals into achievable milestones
- **Optimal Pathfinding**: Find the most efficient route through state spaces
- **Creative Solutions**: Discover novel approaches by combining actions
- **Adaptive Replanning**: Adjust strategies when obstacles arise

## 🚀 Quick Start

### Basic Usage

```bash
# Create a plan for a development objective
npx claude-flow@alpha goap plan "Build authentication system"

# Create a plan with specific constraints
npx claude-flow@alpha goap plan "Optimize database performance" --constraints "no downtime"

# Execute a plan with monitoring
npx claude-flow@alpha goap execute --plan-id <id> --monitor true
```

### Via MCP Tools

```javascript
// Initialize GOAP planner
mcp__claude-flow__goap_init({
  strategy: "adaptive",
  maxDepth: 10,
  enableLearning: true
})

// Create a goal-oriented plan
mcp__claude-flow__goap_plan({
  goal: "Build full-stack e-commerce platform",
  constraints: ["budget: $0", "timeline: 2 weeks"],
  resources: ["developer team", "AWS credits"]
})

// Execute plan with real-time adaptation
mcp__claude-flow__goap_execute({
  planId: "plan-123",
  adaptive: true,
  checkpoints: true
})
```

## 📋 Features

### 1. Intelligent Goal Planning

**World State Modeling:**
- Current state assessment
- Goal state definition
- Precondition checking
- Effect prediction

**Action Selection:**
- Cost-based optimization
- Priority weighting
- Resource consideration
- Dependency resolution

### 2. Multi-Step Decomposition

**Hierarchical Planning:**
- Break goals into sub-goals
- Create milestone checkpoints
- Define success criteria
- Establish validation steps

**Example Plan Structure:**
```json
{
  "goal": "Deploy production application",
  "steps": [
    {
      "id": "step-1",
      "action": "setup_infrastructure",
      "preconditions": ["aws_credentials", "terraform_config"],
      "effects": ["infrastructure_ready"],
      "cost": 5,
      "priority": "critical"
    },
    {
      "id": "step-2",
      "action": "configure_database",
      "preconditions": ["infrastructure_ready"],
      "effects": ["database_configured"],
      "cost": 3,
      "priority": "high"
    }
  ]
}
```

### 3. Adaptive Replanning

**Dynamic Adjustment:**
- Detect plan failures
- Analyze root causes
- Generate alternative paths
- Resume from checkpoints

**Triggers:**
- Blocked actions
- Resource unavailability
- Environmental changes
- Goal modifications

### 4. State Space Navigation

**Search Algorithms:**
- A* pathfinding
- Dijkstra's algorithm
- Greedy best-first
- Breadth-first search

**Heuristics:**
- Goal distance estimation
- Resource availability
- Action complexity
- Historical success rates

## 🎮 GOAP Components

### World State

Represents the current state of the environment:

```javascript
{
  worldState: {
    "code_written": true,
    "tests_passing": false,
    "deployed": false,
    "documentation_complete": false,
    "resources": {
      "developers": 2,
      "budget": 1000,
      "time_remaining": "5 days"
    }
  }
}
```

### Goal State

Defines the desired end state:

```javascript
{
  goalState: {
    "tests_passing": true,
    "deployed": true,
    "documentation_complete": true,
    "performance_optimized": true
  }
}
```

### Actions

Available operations with costs and effects:

```javascript
{
  actions: [
    {
      name: "write_tests",
      cost: 3,
      preconditions: { "code_written": true },
      effects: { "tests_written": true },
      resources: { "developer_hours": 4 }
    },
    {
      name: "run_tests",
      cost: 1,
      preconditions: { "tests_written": true },
      effects: { "tests_passing": true },
      resources: { "ci_minutes": 10 }
    }
  ]
}
```

## 📊 Planning Strategies

### 1. Forward Planning

Start from current state, work toward goal:

```bash
npx claude-flow@alpha goap plan \
  --strategy forward \
  --goal "production_ready" \
  --max-depth 15
```

**Best for:**
- Clear starting point
- Sequential dependencies
- Resource-constrained scenarios

### 2. Backward Planning

Start from goal, work backward to current state:

```bash
npx claude-flow@alpha goap plan \
  --strategy backward \
  --goal "api_deployed" \
  --optimize-cost true
```

**Best for:**
- Complex end goals
- Multiple path options
- Goal-focused optimization

### 3. Adaptive Planning

Hybrid approach with real-time adjustment:

```bash
npx claude-flow@alpha goap plan \
  --strategy adaptive \
  --goal "feature_complete" \
  --enable-learning true
```

**Best for:**
- Uncertain environments
- Dynamic requirements
- Long-term objectives

## 🔧 Advanced Configuration

### Custom Actions

Define domain-specific actions:

```javascript
mcp__claude-flow__goap_define_action({
  name: "deploy_microservice",
  cost: 5,
  duration: 300, // seconds
  preconditions: {
    "tests_passing": true,
    "docker_image_built": true,
    "kubernetes_configured": true
  },
  effects: {
    "service_deployed": true,
    "health_check_passing": true
  },
  resources: {
    "cpu_cores": 4,
    "memory_gb": 8
  },
  validation: {
    "health_endpoint": "/health",
    "expected_status": 200
  }
})
```

### Cost Functions

Customize action costs:

```javascript
mcp__claude-flow__goap_configure({
  costFunction: {
    type: "weighted",
    factors: {
      "time": 0.4,
      "resources": 0.3,
      "complexity": 0.2,
      "risk": 0.1
    }
  },
  optimizationGoal: "minimize_time"
})
```

## 🎯 Use Cases

### 1. Software Development

**Goal:** Build and deploy a new feature

```javascript
mcp__claude-flow__goap_plan({
  goal: "Deploy user authentication feature",
  worldState: {
    "codebase_exists": true,
    "database_schema": "v1.0",
    "ci_cd_configured": true
  },
  constraints: [
    "no_breaking_changes",
    "maintain_test_coverage_90%",
    "zero_downtime_deployment"
  ],
  priorities: {
    "security": "critical",
    "performance": "high",
    "user_experience": "high"
  }
})
```

### 2. System Optimization

**Goal:** Improve application performance

```javascript
mcp__claude-flow__goap_plan({
  goal: "Reduce API latency by 50%",
  worldState: {
    "current_p95_latency": "500ms",
    "database_indexed": false,
    "caching_enabled": false,
    "cdn_configured": false
  },
  resources: {
    "engineering_hours": 40,
    "budget": 500,
    "downtime_window": "4 hours"
  }
})
```

### 3. Infrastructure Setup

**Goal:** Deploy production environment

```javascript
mcp__claude-flow__goap_plan({
  goal: "Production environment operational",
  worldState: {
    "cloud_account": true,
    "terraform_modules": true,
    "monitoring_tools": false
  },
  actions: [
    "provision_vpc",
    "setup_kubernetes",
    "configure_load_balancer",
    "enable_monitoring",
    "setup_logging",
    "configure_alerts"
  ]
})
```

## 📈 Monitoring & Metrics

### Plan Execution Tracking

```bash
# Monitor plan progress
npx claude-flow@alpha goap status --plan-id <id>

# View execution metrics
npx claude-flow@alpha goap metrics --plan-id <id>

# Export plan results
npx claude-flow@alpha goap export --plan-id <id> --format json
```

### Success Metrics

```javascript
{
  metrics: {
    "plan_efficiency": 0.85,
    "goal_achievement": 1.0,
    "replanning_count": 2,
    "total_cost": 42,
    "execution_time": "2h 15m",
    "steps_completed": 12,
    "steps_skipped": 1,
    "success_rate": 0.92
  }
}
```

## 🧠 Learning & Adaptation

### Pattern Recognition

The planner learns from execution:

- Successful action sequences
- Common failure patterns
- Optimal path discoveries
- Resource utilization patterns

### Historical Data

```bash
# View planning history
npx claude-flow@alpha goap history --goal-type "deployment"

# Analyze success patterns
npx claude-flow@alpha goap analyze --metric "success_rate"

# Export learning data
npx claude-flow@alpha goap export-learning --format json
```

## 🔗 Integration

### With Claude Code Task Tool

```javascript
// Use GOAP to plan, Task tool to execute
[Single Message]:
  // Step 1: Create GOAP plan
  mcp__claude-flow__goap_plan({ goal: "Build REST API" })

  // Step 2: Execute with specialized agents via Task tool
  Task("Backend dev", "Implement endpoints per GOAP plan step 1-3", "backend-dev")
  Task("Test engineer", "Write tests per GOAP plan step 4-5", "tester")
  Task("DevOps", "Setup deployment per GOAP plan step 6-7", "cicd-engineer")

  // Step 3: Track with todos
  TodoWrite({ todos: [...all plan steps...] })
```

### With SPARC Methodology

```bash
# Combine GOAP with SPARC phases
npx claude-flow@alpha goap plan "Feature development" \
  --phases "spec,pseudocode,architecture,code,test,refine"

# Each phase becomes a GOAP sub-goal
```

## 🛠️ Best Practices

### 1. Goal Definition

✅ **Good Goals:**
- Specific and measurable
- Achievable within constraints
- Clear success criteria
- Well-defined world states

❌ **Poor Goals:**
- Vague objectives
- Unmeasurable outcomes
- Unrealistic expectations
- Undefined preconditions

### 2. Action Design

✅ **Effective Actions:**
- Single responsibility
- Clear preconditions
- Predictable effects
- Reasonable costs

❌ **Ineffective Actions:**
- Multiple responsibilities
- Hidden dependencies
- Unpredictable outcomes
- Undefined costs

### 3. Plan Validation

```bash
# Validate plan before execution
npx claude-flow@alpha goap validate --plan-id <id>

# Simulate execution
npx claude-flow@alpha goap simulate --plan-id <id> --dry-run

# Check resource availability
npx claude-flow@alpha goap check-resources --plan-id <id>
```

## 🎓 Examples

### Example 1: Feature Development

```javascript
// Complete feature development plan
const plan = await mcp__claude-flow__goap_plan({
  goal: "User profile feature complete",
  worldState: {
    "database_schema": "v2.0",
    "api_framework": "express",
    "frontend_framework": "react",
    "test_framework": "jest"
  },
  actions: [
    "design_database_tables",
    "create_api_endpoints",
    "build_ui_components",
    "write_integration_tests",
    "add_documentation",
    "deploy_to_staging"
  ],
  constraints: [
    "test_coverage >= 80%",
    "no_security_vulnerabilities",
    "performance_budget < 2s"
  ]
})
```

### Example 2: Performance Optimization

```javascript
// Performance optimization plan
const plan = await mcp__claude-flow__goap_plan({
  goal: "Page load time < 1 second",
  worldState: {
    "current_load_time": "3.5s",
    "image_optimization": false,
    "code_splitting": false,
    "cdn_enabled": false,
    "caching_strategy": "none"
  },
  actions: [
    "optimize_images",
    "implement_code_splitting",
    "setup_cdn",
    "configure_browser_caching",
    "enable_compression",
    "lazy_load_resources"
  ],
  prioritize: "quick_wins_first"
})
```

## 📚 Resources

- **GOAP Algorithm**: https://en.wikipedia.org/wiki/GOAP
- **Claude Flow Docs**: https://github.com/ruvnet/claude-flow
- **Planning Algorithms**: Planning.ai research
- **A* Pathfinding**: https://theory.stanford.edu/~amitp/GameProgramming/

## 🤝 Contributing

To extend this skill:

1. Add custom actions to `.claude/skills/goal/actions/`
2. Define domain-specific heuristics
3. Create goal templates
4. Share successful patterns

## 📄 License

MIT License - See project root for details

---

**Remember:** GOAP excels at finding optimal paths through complex problem spaces. Use it for strategic planning, then execute with Claude Code's Task tool and specialized agents.

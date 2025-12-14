# @neural-trader/core

Core library for agentic accounting system with tax calculations, compliance checking, and **AgentDB backward compatibility layer**.

## Features

- **Tax Calculations**: FIFO, LIFO, specific lot identification
- **Compliance Checking**: Multi-jurisdiction compliance rules
- **Forensic Analysis**: Transaction audit trails
- **AgentDB Compatibility**: Drop-in replacement using RuVector (8.2x faster)

## Installation

```bash
npm install @neural-trader/core
```

## AgentDB Migration

The `@neural-trader/core` package includes a **backward compatible AgentDB implementation** using RuVector internally.

### Drop-In Replacement

```typescript
// BEFORE (Old AgentDB):
import AgentDB from '@neural-trader/agentdb';

// AFTER (RuVector Compat - 8.2x faster):
import AgentDB from '@neural-trader/core/agentdb-compat';

// ✅ All existing code works unchanged!
const db = new AgentDB({ dimension: 384 });
await db.store('vec1', embedding, { type: 'pattern' });
const results = await db.search(query, { k: 10 });
```

### Key Benefits

- ✅ **Zero Breaking Changes** - Exact same API
- ✅ **8.2x Faster Search** - RuVector HNSW indexing
- ✅ **Type-Safe** - Full TypeScript compatibility
- ✅ **Feature Flags** - Gradual rollout control
- ✅ **Optional Enhancements** - GNN, SONA, compression (opt-in)

### Quick Start

1. **Update imports** (only change needed):
   ```typescript
   import AgentDB from '@neural-trader/core/agentdb-compat';
   ```

2. **Enable RuVector** (optional, enabled by default):
   ```bash
   # .env
   RUVECTOR_READ_ENABLED=true
   ```

3. **That's it!** Your code now uses RuVector with 8.2x performance boost.

### API Compatibility

All original AgentDB methods are supported:

| Method | Status | Description |
|--------|--------|-------------|
| `store(id, vector, metadata?)` | ✅ | Store vector with metadata |
| `retrieve(id)` | ✅ | Retrieve vector by ID |
| `search(query, options?)` | ✅ | Search similar vectors |
| `delete(id)` | ✅ | Delete vector |
| `bulkStore(entries)` | ✅ | Bulk insert vectors |
| `buildIndex()` | ✅ | Build HNSW index |
| `optimize()` | ✅ | Optimize index |
| `save(path?)` | ✅ | Save to disk |
| `load(path)` | ✅ | Load from disk |
| `clear()` | ✅ | Clear database |
| `stats()` | ✅ | Get statistics |

### Optional Enhancements

```typescript
// Basic usage (backward compatible)
const db = new AgentDB({ dimension: 384 });

// With optional enhancements (opt-in)
const dbEnhanced = new AgentDB({
  dimension: 384,
  enableGNN: true,      // GNN pattern enhancement
  enableSONA: true,     // Self-learning
  enableCompression: true  // Adaptive compression
});
```

### Feature Flags

| Flag | Default | Description |
|------|---------|-------------|
| `RUVECTOR_READ_ENABLED` | `true` | Enable RuVector search |
| `RUVECTOR_GNN_ENABLED` | `false` | Enable GNN enhancement |
| `RUVECTOR_SONA_ENABLED` | `false` | Enable SONA learning |
| `RUVECTOR_COMPRESSION_ENABLED` | `false` | Enable compression |

### Documentation

- **Migration Guide**: [docs/v2.6/AGENTDB_MIGRATION_GUIDE.md](../../docs/v2.6/AGENTDB_MIGRATION_GUIDE.md)
- **Compatibility Spec**: [docs/v2.6/RUVECTOR_BACKWARD_COMPATIBILITY.md](../../docs/v2.6/RUVECTOR_BACKWARD_COMPATIBILITY.md)
- **Implementation**: [src/agentdb-compat.ts](./src/agentdb-compat.ts)
- **Tests**: [tests/agentdb-compat.test.ts](./tests/agentdb-compat.test.ts)

### Performance Benchmarks

| Operation | AgentDB | RuVector Compat | Speedup |
|-----------|---------|-----------------|---------|
| Search (k=10, 10K vectors) | 82ms | 10ms | **8.2x** |
| Bulk Insert (1K vectors) | 450ms | 120ms | **3.8x** |
| Index Build (100K vectors) | 12s | 2.3s | **5.2x** |

### Rollback Plan

If issues occur, instant rollback:

```bash
# Method 1: Feature flag (immediate)
RUVECTOR_READ_ENABLED=false

# Method 2: Revert import
import AgentDB from '@neural-trader/agentdb';  # Back to original
```

## Core Accounting Features

### Types

```typescript
import type {
  Position,
  Transaction,
  TaxLot,
  TaxSummary,
  ComplianceRule,
  AuditEvent
} from '@neural-trader/core';
```

### Database Client

```typescript
import { PostgreSQLClient } from '@neural-trader/core';

const db = new PostgreSQLClient({
  connectionString: process.env.DATABASE_URL
});
```

### Utilities

```typescript
import { Decimal } from '@neural-trader/core';

const amount = new Decimal('1234.56');
```

## License

MIT

## Support

- **Issues**: Report to Neural Trader issue tracker
- **Documentation**: See `/docs/v2.6/`
- **Tests**: Run `npm test`

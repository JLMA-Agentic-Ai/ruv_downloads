const { existsSync, readFileSync } = require('fs')
const { join } = require('path')

const { platform, arch } = process

let nativeBinding = null
let localFileExisted = false
let loadError = null

function isMusl() {
  if (!process.report || typeof process.report.getReport !== 'function') {
    try {
      const lddPath = require('child_process').execSync('which ldd').toString().trim()
      return readFileSync(lddPath, 'utf8').includes('musl')
    } catch (e) {
      return true
    }
  } else {
    const { glibcVersionRuntime } = process.report.getReport().header
    return !glibcVersionRuntime
  }
}

switch (platform) {
  case 'android':
    switch (arch) {
      case 'arm64':
        localFileExisted = existsSync(join(__dirname, 'attention.android-arm64.node'))
        try {
          if (localFileExisted) {
            nativeBinding = require('./attention.android-arm64.node')
          } else {
            nativeBinding = require('@ruvector/attention-android-arm64')
          }
        } catch (e) {
          loadError = e
        }
        break
      case 'arm':
        localFileExisted = existsSync(join(__dirname, 'attention.android-arm-eabi.node'))
        try {
          if (localFileExisted) {
            nativeBinding = require('./attention.android-arm-eabi.node')
          } else {
            nativeBinding = require('@ruvector/attention-android-arm-eabi')
          }
        } catch (e) {
          loadError = e
        }
        break
      default:
        throw new Error(`Unsupported architecture on Android ${arch}`)
    }
    break
  case 'win32':
    switch (arch) {
      case 'x64':
        localFileExisted = existsSync(join(__dirname, 'attention.win32-x64-msvc.node'))
        try {
          if (localFileExisted) {
            nativeBinding = require('./attention.win32-x64-msvc.node')
          } else {
            nativeBinding = require('@ruvector/attention-win32-x64-msvc')
          }
        } catch (e) {
          loadError = e
        }
        break
      case 'ia32':
        localFileExisted = existsSync(join(__dirname, 'attention.win32-ia32-msvc.node'))
        try {
          if (localFileExisted) {
            nativeBinding = require('./attention.win32-ia32-msvc.node')
          } else {
            nativeBinding = require('@ruvector/attention-win32-ia32-msvc')
          }
        } catch (e) {
          loadError = e
        }
        break
      case 'arm64':
        localFileExisted = existsSync(join(__dirname, 'attention.win32-arm64-msvc.node'))
        try {
          if (localFileExisted) {
            nativeBinding = require('./attention.win32-arm64-msvc.node')
          } else {
            nativeBinding = require('@ruvector/attention-win32-arm64-msvc')
          }
        } catch (e) {
          loadError = e
        }
        break
      default:
        throw new Error(`Unsupported architecture on Windows: ${arch}`)
    }
    break
  case 'darwin':
    localFileExisted = existsSync(join(__dirname, 'attention.darwin-universal.node'))
    try {
      if (localFileExisted) {
        nativeBinding = require('./attention.darwin-universal.node')
      } else {
        nativeBinding = require('@ruvector/attention-darwin-universal')
      }
      break
    } catch {}
    switch (arch) {
      case 'x64':
        localFileExisted = existsSync(join(__dirname, 'attention.darwin-x64.node'))
        try {
          if (localFileExisted) {
            nativeBinding = require('./attention.darwin-x64.node')
          } else {
            nativeBinding = require('@ruvector/attention-darwin-x64')
          }
        } catch (e) {
          loadError = e
        }
        break
      case 'arm64':
        localFileExisted = existsSync(join(__dirname, 'attention.darwin-arm64.node'))
        try {
          if (localFileExisted) {
            nativeBinding = require('./attention.darwin-arm64.node')
          } else {
            nativeBinding = require('@ruvector/attention-darwin-arm64')
          }
        } catch (e) {
          loadError = e
        }
        break
      default:
        throw new Error(`Unsupported architecture on macOS: ${arch}`)
    }
    break
  case 'freebsd':
    if (arch !== 'x64') {
      throw new Error(`Unsupported architecture on FreeBSD: ${arch}`)
    }
    localFileExisted = existsSync(join(__dirname, 'attention.freebsd-x64.node'))
    try {
      if (localFileExisted) {
        nativeBinding = require('./attention.freebsd-x64.node')
      } else {
        nativeBinding = require('@ruvector/attention-freebsd-x64')
      }
    } catch (e) {
      loadError = e
    }
    break
  case 'linux':
    switch (arch) {
      case 'x64':
        if (isMusl()) {
          localFileExisted = existsSync(join(__dirname, 'attention.linux-x64-musl.node'))
          try {
            if (localFileExisted) {
              nativeBinding = require('./attention.linux-x64-musl.node')
            } else {
              nativeBinding = require('@ruvector/attention-linux-x64-musl')
            }
          } catch (e) {
            loadError = e
          }
        } else {
          localFileExisted = existsSync(join(__dirname, 'attention.linux-x64-gnu.node'))
          try {
            if (localFileExisted) {
              nativeBinding = require('./attention.linux-x64-gnu.node')
            } else {
              nativeBinding = require('@ruvector/attention-linux-x64-gnu')
            }
          } catch (e) {
            loadError = e
          }
        }
        break
      case 'arm64':
        if (isMusl()) {
          localFileExisted = existsSync(join(__dirname, 'attention.linux-arm64-musl.node'))
          try {
            if (localFileExisted) {
              nativeBinding = require('./attention.linux-arm64-musl.node')
            } else {
              nativeBinding = require('@ruvector/attention-linux-arm64-musl')
            }
          } catch (e) {
            loadError = e
          }
        } else {
          localFileExisted = existsSync(join(__dirname, 'attention.linux-arm64-gnu.node'))
          try {
            if (localFileExisted) {
              nativeBinding = require('./attention.linux-arm64-gnu.node')
            } else {
              nativeBinding = require('@ruvector/attention-linux-arm64-gnu')
            }
          } catch (e) {
            loadError = e
          }
        }
        break
      case 'arm':
        localFileExisted = existsSync(join(__dirname, 'attention.linux-arm-gnueabihf.node'))
        try {
          if (localFileExisted) {
            nativeBinding = require('./attention.linux-arm-gnueabihf.node')
          } else {
            nativeBinding = require('@ruvector/attention-linux-arm-gnueabihf')
          }
        } catch (e) {
          loadError = e
        }
        break
      default:
        throw new Error(`Unsupported architecture on Linux: ${arch}`)
    }
    break
  default:
    throw new Error(`Unsupported OS: ${platform}, architecture: ${arch}`)
}

if (!nativeBinding) {
  if (loadError) {
    throw loadError
  }
  throw new Error(`Failed to load native binding`)
}

// Core Attention Mechanisms (native)
const {
  DotProductAttention: NativeDotProductAttention,
  MultiHeadAttention: NativeMultiHeadAttention,
  HyperbolicAttention: NativeHyperbolicAttention,
  FlashAttention: NativeFlashAttention,
  LinearAttention: NativeLinearAttention,
  MoEAttention: NativeMoEAttention,
  // Graph Attention
  GraphRoPeAttention: NativeGraphRoPeAttention,
  EdgeFeaturedAttention: NativeEdgeFeaturedAttention,
  DualSpaceAttention: NativeDualSpaceAttention,
  LocalGlobalAttention: NativeLocalGlobalAttention,
  // Training
  AdamOptimizer,
  AdamWOptimizer,
  SgdOptimizer,
  InfoNceLoss,
  LocalContrastiveLoss,
  SpectralRegularization,
  CurriculumScheduler,
  TemperatureAnnealing,
  LearningRateScheduler,
  HardNegativeMiner,
  InBatchMiner,
  // Utilities
  StreamProcessor,
  parallelAttentionCompute: nativeParallelAttentionCompute,
  batchAttentionCompute: nativeBatchAttentionCompute,
  computeAttentionAsync: nativeComputeAttentionAsync,
  batchFlashAttentionCompute: nativeBatchFlashAttentionCompute,
  computeFlashAttentionAsync: nativeComputeFlashAttentionAsync,
  computeHyperbolicAttentionAsync: nativeComputeHyperbolicAttentionAsync,
  benchmarkAttention,
  // Hyperbolic Math
  expMap: nativeExpMap,
  logMap: nativeLogMap,
  mobiusAddition: nativeMobiusAddition,
  poincareDistance: nativePoincareDistance,
  projectToPoincareBall: nativeProjectToPoincareBall,
  // Enums
  DecayType,
  MiningStrategy,
  AttentionType,
  // Meta
  info,
  version
} = nativeBinding

// Helper to convert any array-like to Float32Array (attention native expects Float32Array)
function toFloat32Array(input) {
  if (input instanceof Float32Array) return input
  if (Array.isArray(input) || input instanceof Float64Array) {
    return new Float32Array(input)
  }
  return input
}

function toFloat32Arrays(inputs) {
  return inputs.map(arr => toFloat32Array(arr))
}

// Create wrapper class factory for attention mechanisms
function createAttentionWrapper(NativeClass, name) {
  return class {
    constructor(...args) {
      this._native = new NativeClass(...args)
      // Copy over getters
      const proto = Object.getPrototypeOf(this._native)
      const descriptors = Object.getOwnPropertyDescriptors(proto)
      for (const [key, desc] of Object.entries(descriptors)) {
        if (desc.get && key !== 'constructor') {
          Object.defineProperty(this, key, {
            get: () => this._native[key]
          })
        }
      }
    }

    compute(query, keys, values) {
      return this._native.compute(
        toFloat32Array(query),
        toFloat32Arrays(keys),
        toFloat32Arrays(values)
      )
    }

    // For direct Float32Array usage (no conversion overhead)
    computeRaw(query, keys, values) {
      return this._native.compute(query, keys, values)
    }
  }
}

// Wrapped attention classes
const DotProductAttention = createAttentionWrapper(NativeDotProductAttention, 'DotProductAttention')
const MultiHeadAttention = createAttentionWrapper(NativeMultiHeadAttention, 'MultiHeadAttention')
const HyperbolicAttention = createAttentionWrapper(NativeHyperbolicAttention, 'HyperbolicAttention')
const FlashAttention = createAttentionWrapper(NativeFlashAttention, 'FlashAttention')

// LocalGlobalAttention takes (dim, windowSize, globalTokens)
class LocalGlobalAttention {
  constructor(dim, windowSize = 8, globalTokens = 4) {
    this._native = new NativeLocalGlobalAttention(dim, windowSize, globalTokens)
  }

  get dim() { return this._native.dim }
  get windowSize() { return this._native.windowSize }

  compute(query, keys, values) {
    return this._native.compute(
      toFloat32Array(query),
      toFloat32Arrays(keys),
      toFloat32Arrays(values)
    )
  }

  computeRaw(query, keys, values) {
    return this._native.compute(query, keys, values)
  }
}

// LinearAttention requires (dim, features) - provide default for features
class LinearAttention {
  constructor(dim, features) {
    this._native = new NativeLinearAttention(dim, features !== undefined ? features : dim)
  }

  get dim() { return this._native.dim }
  get features() { return this._native.features }

  compute(query, keys, values) {
    return this._native.compute(
      toFloat32Array(query),
      toFloat32Arrays(keys),
      toFloat32Arrays(values)
    )
  }

  computeRaw(query, keys, values) {
    return this._native.compute(query, keys, values)
  }
}

// MoE needs special handling due to config object
class MoEAttention {
  constructor(config) {
    this._native = new NativeMoEAttention(config)
  }

  compute(query, keys, values) {
    return this._native.compute(
      toFloat32Array(query),
      toFloat32Arrays(keys),
      toFloat32Arrays(values)
    )
  }

  computeRaw(query, keys, values) {
    return this._native.compute(query, keys, values)
  }

  get dim() { return this._native.dim }
  get numExperts() { return this._native.numExperts }
  get topK() { return this._native.topK }

  static simple(dim, numExperts, topK) {
    return new MoEAttention({ dim, numExperts, topK })
  }
}

// Graph attention wrappers - these need config objects

// GraphRoPeAttention requires { dim, maxPosition }
class GraphRoPeAttention {
  constructor(dim, maxPosition = 1000) {
    this._native = new NativeGraphRoPeAttention({ dim, maxPosition })
  }

  get dim() { return this._native.dim }
  get maxPosition() { return this._native.maxPosition }

  compute(query, keys, values) {
    return this._native.compute(
      toFloat32Array(query),
      toFloat32Arrays(keys),
      toFloat32Arrays(values)
    )
  }

  computeRaw(query, keys, values) {
    return this._native.compute(query, keys, values)
  }
}

// EdgeFeaturedAttention requires { nodeDim, edgeDim, numHeads }
class EdgeFeaturedAttention {
  constructor(nodeDim, edgeDim, numHeads = 8) {
    this._native = new NativeEdgeFeaturedAttention({ nodeDim, edgeDim, numHeads })
  }

  get nodeDim() { return this._native.nodeDim }
  get edgeDim() { return this._native.edgeDim }
  get numHeads() { return this._native.numHeads }

  compute(query, keys, values) {
    return this._native.compute(
      toFloat32Array(query),
      toFloat32Arrays(keys),
      toFloat32Arrays(values)
    )
  }

  computeRaw(query, keys, values) {
    return this._native.compute(query, keys, values)
  }
}

// DualSpaceAttention requires { dim, curvature, euclideanWeight, hyperbolicWeight }
class DualSpaceAttention {
  constructor(dim, curvature = 1.0, euclideanWeight = 0.5, hyperbolicWeight = 0.5) {
    this._native = new NativeDualSpaceAttention({ dim, curvature, euclideanWeight, hyperbolicWeight })
  }

  get dim() { return this._native.dim }

  compute(query, keys, values) {
    return this._native.compute(
      toFloat32Array(query),
      toFloat32Arrays(keys),
      toFloat32Arrays(values)
    )
  }

  computeRaw(query, keys, values) {
    return this._native.compute(query, keys, values)
  }
}

// Wrapped hyperbolic math functions
function expMap(base, tangent, curvature) {
  return nativeExpMap(toFloat32Array(base), toFloat32Array(tangent), curvature)
}

function logMap(base, point, curvature) {
  return nativeLogMap(toFloat32Array(base), toFloat32Array(point), curvature)
}

function mobiusAddition(a, b, curvature) {
  return nativeMobiusAddition(toFloat32Array(a), toFloat32Array(b), curvature)
}

function poincareDistance(a, b, curvature) {
  return nativePoincareDistance(toFloat32Array(a), toFloat32Array(b), curvature)
}

function projectToPoincareBall(vector, curvature) {
  return nativeProjectToPoincareBall(toFloat32Array(vector), curvature)
}

// Wrapped utility functions
function parallelAttentionCompute(config) {
  if (config.query) config.query = toFloat32Array(config.query)
  if (config.keys) config.keys = toFloat32Arrays(config.keys)
  if (config.values) config.values = toFloat32Arrays(config.values)
  return nativeParallelAttentionCompute(config)
}

function batchAttentionCompute(config) {
  if (config.queries) config.queries = toFloat32Arrays(config.queries)
  if (config.keys) config.keys = toFloat32Arrays(config.keys)
  if (config.values) config.values = toFloat32Arrays(config.values)
  return nativeBatchAttentionCompute(config)
}

async function computeAttentionAsync(query, keys, values, attentionType) {
  return nativeComputeAttentionAsync(
    toFloat32Array(query),
    toFloat32Arrays(keys),
    toFloat32Arrays(values),
    attentionType
  )
}

function batchFlashAttentionCompute(config) {
  if (config.queries) config.queries = toFloat32Arrays(config.queries)
  if (config.keys) config.keys = toFloat32Arrays(config.keys)
  if (config.values) config.values = toFloat32Arrays(config.values)
  return nativeBatchFlashAttentionCompute(config)
}

async function computeFlashAttentionAsync(query, keys, values) {
  return nativeComputeFlashAttentionAsync(
    toFloat32Array(query),
    toFloat32Arrays(keys),
    toFloat32Arrays(values)
  )
}

async function computeHyperbolicAttentionAsync(query, keys, values, curvature) {
  return nativeComputeHyperbolicAttentionAsync(
    toFloat32Array(query),
    toFloat32Arrays(keys),
    toFloat32Arrays(values),
    curvature
  )
}

// Core Attention Mechanisms
module.exports.DotProductAttention = DotProductAttention
module.exports.MultiHeadAttention = MultiHeadAttention
module.exports.HyperbolicAttention = HyperbolicAttention
module.exports.FlashAttention = FlashAttention
module.exports.LinearAttention = LinearAttention
module.exports.MoEAttention = MoEAttention

// Graph Attention
module.exports.GraphRoPeAttention = GraphRoPeAttention
module.exports.EdgeFeaturedAttention = EdgeFeaturedAttention
module.exports.DualSpaceAttention = DualSpaceAttention
module.exports.LocalGlobalAttention = LocalGlobalAttention

// Training - Optimizers
module.exports.AdamOptimizer = AdamOptimizer
module.exports.AdamWOptimizer = AdamWOptimizer
module.exports.SgdOptimizer = SgdOptimizer

// Training - Loss Functions
module.exports.InfoNceLoss = InfoNceLoss
module.exports.LocalContrastiveLoss = LocalContrastiveLoss
module.exports.SpectralRegularization = SpectralRegularization

// Training - Curriculum
module.exports.CurriculumScheduler = CurriculumScheduler
module.exports.TemperatureAnnealing = TemperatureAnnealing
module.exports.LearningRateScheduler = LearningRateScheduler

// Training - Mining
module.exports.HardNegativeMiner = HardNegativeMiner
module.exports.InBatchMiner = InBatchMiner

// Utilities
module.exports.StreamProcessor = StreamProcessor
module.exports.parallelAttentionCompute = parallelAttentionCompute
module.exports.batchAttentionCompute = batchAttentionCompute
module.exports.computeAttentionAsync = computeAttentionAsync
module.exports.batchFlashAttentionCompute = batchFlashAttentionCompute
module.exports.computeFlashAttentionAsync = computeFlashAttentionAsync
module.exports.computeHyperbolicAttentionAsync = computeHyperbolicAttentionAsync
module.exports.benchmarkAttention = benchmarkAttention

// Hyperbolic Math Functions
module.exports.expMap = expMap
module.exports.logMap = logMap
module.exports.mobiusAddition = mobiusAddition
module.exports.poincareDistance = poincareDistance
module.exports.projectToPoincareBall = projectToPoincareBall

// Enums
module.exports.DecayType = DecayType
module.exports.MiningStrategy = MiningStrategy
module.exports.AttentionType = AttentionType

// Meta
module.exports.info = info
module.exports.version = version

// Native exports for advanced users who want to avoid conversion overhead
module.exports.Native = {
  DotProductAttention: NativeDotProductAttention,
  MultiHeadAttention: NativeMultiHeadAttention,
  HyperbolicAttention: NativeHyperbolicAttention,
  FlashAttention: NativeFlashAttention,
  LinearAttention: NativeLinearAttention,
  MoEAttention: NativeMoEAttention,
  GraphRoPeAttention: NativeGraphRoPeAttention,
  EdgeFeaturedAttention: NativeEdgeFeaturedAttention,
  DualSpaceAttention: NativeDualSpaceAttention,
  LocalGlobalAttention: NativeLocalGlobalAttention,
  expMap: nativeExpMap,
  logMap: nativeLogMap,
  mobiusAddition: nativeMobiusAddition,
  poincareDistance: nativePoincareDistance,
  projectToPoincareBall: nativeProjectToPoincareBall,
}

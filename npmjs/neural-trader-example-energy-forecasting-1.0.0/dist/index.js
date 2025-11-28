"use strict";
/**
 * @neural-trader/example-energy-forecasting
 *
 * Self-learning energy forecasting with conformal prediction and swarm-based ensemble models
 *
 * @module @neural-trader/example-energy-forecasting
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createModel = exports.ProphetModel = exports.TransformerModel = exports.LSTMModel = exports.ARIMAModel = exports.EnsembleSwarm = exports.EnergyConformalPredictor = exports.EnergyForecaster = void 0;
// Core exports
var forecaster_1 = require("./forecaster");
Object.defineProperty(exports, "EnergyForecaster", { enumerable: true, get: function () { return forecaster_1.EnergyForecaster; } });
var conformal_predictor_1 = require("./conformal-predictor");
Object.defineProperty(exports, "EnergyConformalPredictor", { enumerable: true, get: function () { return conformal_predictor_1.EnergyConformalPredictor; } });
var ensemble_swarm_1 = require("./ensemble-swarm");
Object.defineProperty(exports, "EnsembleSwarm", { enumerable: true, get: function () { return ensemble_swarm_1.EnsembleSwarm; } });
// Model exports
var models_1 = require("./models");
Object.defineProperty(exports, "ARIMAModel", { enumerable: true, get: function () { return models_1.ARIMAModel; } });
Object.defineProperty(exports, "LSTMModel", { enumerable: true, get: function () { return models_1.LSTMModel; } });
Object.defineProperty(exports, "TransformerModel", { enumerable: true, get: function () { return models_1.TransformerModel; } });
Object.defineProperty(exports, "ProphetModel", { enumerable: true, get: function () { return models_1.ProphetModel; } });
Object.defineProperty(exports, "createModel", { enumerable: true, get: function () { return models_1.createModel; } });
// Type exports
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map
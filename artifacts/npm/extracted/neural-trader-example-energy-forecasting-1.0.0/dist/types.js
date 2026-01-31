"use strict";
/**
 * Core types for energy forecasting system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnergyDomain = exports.ModelType = void 0;
/**
 * Supported model types
 */
var ModelType;
(function (ModelType) {
    ModelType["ARIMA"] = "arima";
    ModelType["LSTM"] = "lstm";
    ModelType["TRANSFORMER"] = "transformer";
    ModelType["PROPHET"] = "prophet";
    ModelType["ENSEMBLE"] = "ensemble";
})(ModelType || (exports.ModelType = ModelType = {}));
/**
 * Energy forecasting domain types
 */
var EnergyDomain;
(function (EnergyDomain) {
    EnergyDomain["SOLAR"] = "solar_generation";
    EnergyDomain["WIND"] = "wind_power";
    EnergyDomain["DEMAND"] = "electricity_demand";
    EnergyDomain["TEMPERATURE"] = "temperature";
})(EnergyDomain || (exports.EnergyDomain = EnergyDomain = {}));
//# sourceMappingURL=types.js.map
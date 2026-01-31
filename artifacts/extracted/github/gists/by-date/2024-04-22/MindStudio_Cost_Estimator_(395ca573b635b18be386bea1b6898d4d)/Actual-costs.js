// Pricing per 1 million tokens, converted to per-token cost
const modelPricing = {
  'GPT-4': { inputCost: 30.00 / 1e6, outputCost: 60.00 / 1e6 },
  'GPT-4 32K': { inputCost: 60.00 / 1e6, outputCost: 120.00 / 1e6 },
  'GPT-4 Turbo': { inputCost: 10.00 / 1e6, outputCost: 30.00 / 1e6 },
  'GPT-3.5 Instruct': { inputCost: 1.50 / 1e6, outputCost: 2.00 / 1e6 },
  'GPT-3.5': { inputCost: 0.50 / 1e6, outputCost: 1.50 / 1e6 },
  'Claude 3 Opus': { inputCost: 15.00 / 1e6, outputCost: 75.00 / 1e6 },
  'Claude 2': { inputCost: 8.00 / 1e6, outputCost: 24.00 / 1e6 },
  'Claude 3 Sonnet': { inputCost: 3.00 / 1e6, outputCost: 15.00 / 1e6 },
  'Claude Instant': { inputCost: 0.80 / 1e6, outputCost: 2.40 / 1e6 },
  'Claude 3 Haiku': { inputCost: 0.25 / 1e6, outputCost: 1.25 / 1e6 },
  'PaLM 2': { inputCost: 0.33 / 1e6, outputCost: 0.65 / 1e6 },
  'Gemini Pro': { inputCost: 0.17 / 1e6, outputCost: 0.49 / 1e6 },
  'Gemini Pro Vision': { inputCost: 0.17 / 1e6, outputCost: 0.49 / 1e6 },
  'Mistral 8x7B Instruct': { inputCost: 0.36 / 1e6, outputCost: 0.36 / 1e6 },
  'Mistral 7B Instruct': { inputCost: 0.17 / 1e6, outputCost: 0.17 / 1e6 },
  'Llama-2 70B Chat': { inputCost: 0.91 / 1e6, outputCost: 1.17 / 1e6 },
  'Code Llama': { inputCost: 0.78 / 1e6, outputCost: 0.78 / 1e6 },
  'Llama-2 13B Chat': { inputCost: 0.29 / 1e6, outputCost: 0.29 / 1e6 }
};

// Update Token Costs based on model selection
// created by @rUv, cause i could.

async function updateTokenCosts() {
  const selectedModel = ai.vars.modelSelector || 'GPT-4'; // Default to GPT-4
  let inputCost, outputCost;

  // Pricing per 1 million tokens, converted to per-token cost
const modelPricing = {
  'GPT-4': { inputCost: 36.00 / 1e6, outputCost: 72.00 / 1e6 },
  'GPT-4 Turbo': { inputCost: 12.50 / 1e6, outputCost: 37.50 / 1e6 },
  'GPT-3.5 Instruct': { inputCost: 1.95 / 1e6, outputCost: 2.60 / 1e6 },
  'GPT-3.5': { inputCost: 1.30 / 1e6, outputCost: 2.60 / 1e6 },
  'Claude 3 Opus': { inputCost: 18.00 / 1e6, outputCost: 90.00 / 1e6 },
  'Claude 2': { inputCost: 10.00 / 1e6, outputCost: 30.00 / 1e6 },
  'Claude 3 Sonnet': { inputCost: 3.75 / 1e6, outputCost: 18.75 / 1e6 },
  'Claude Instant': { inputCost: 1.04 / 1e6, outputCost: 3.12 / 1e6 },
  'Claude 3 Haiku': { inputCost: 0.33 / 1e6, outputCost: 1.63 / 1e6 },
  'PaLM 2': { inputCost: 0.33 / 1e6, outputCost: 0.65 / 1e6 },
  'Gemini Pro': { inputCost: 0.17 / 1e6, outputCost: 0.49 / 1e6 },
  'Gemini Pro Vision': { inputCost: 0.17 / 1e6, outputCost: 0.49 / 1e6 },
  'Mistral 8x7B Instruct': { inputCost: 0.36 / 1e6, outputCost: 0.36 / 1e6 },
  'Mistral 7B Instruct': { inputCost: 0.17 / 1e6, outputCost: 0.17 / 1e6 },
  'Llama-2 70B Chat': { inputCost: 0.91 / 1e6, outputCost: 1.17 / 1e6 },
  'Code Llama': { inputCost: 0.78 / 1e6, outputCost: 0.78 / 1e6 },
  'Llama-2 13B Chat': { inputCost: 0.29 / 1e6, outputCost: 0.29 / 1e6 }
};
  if (modelPricing[selectedModel]) {
    inputCost = modelPricing[selectedModel].inputCost;
    outputCost = modelPricing[selectedModel].outputCost;
  } else {
    console.log(`Unknown model selected: ${selectedModel}`);
    ai.log(`Unknown model selected: ${selectedModel}`);
    return;
  }

  ai.vars.costPerTokenInput = inputCost;
  ai.vars.costPerTokenOutput = outputCost;
  ai.vars.costPerToken = (inputCost + outputCost) / 2;

  await calculate();
}

// Calculate Token and Operational Costs
async function calculate() {
  const inputTokens = parseFloat(ai.vars.inputTokens);
  const outputTokens = parseFloat(ai.vars.outputTokens);
  const costPerToken = ai.vars.costPerToken;

  const totalTokenCost = (inputTokens + outputTokens) * costPerToken;
  ai.vars.totalTokenCost = totalTokenCost.toFixed(2);

  console.log(`Total Token Cost for ${ai.vars.modelSelector}: $${ai.vars.totalTokenCost}`);
  ai.log(`Total Token Cost for ${ai.vars.modelSelector}: $${ai.vars.totalTokenCost}`);

  const requestsPerDay = parseFloat(ai.vars.requestsPerDay);
  const daysPerMonth = parseFloat(ai.vars.daysPerMonth);
  const deploymentCost = requestsPerDay * daysPerMonth * costPerToken;
  ai.vars.deploymentCost = deploymentCost.toFixed(2);

  console.log(`Deployment Cost for ${ai.vars.modelSelector}: $${ai.vars.deploymentCost}`);
  ai.log(`Deployment Cost for ${ai.vars.modelSelector}: $${ai.vars.deploymentCost}`);
}

// Function to initialize the cost estimation process
async function initializeCostEstimation() {
  ai.vars.modelSelector = ai.vars.modelSelector || 'GPT-4';
  ai.vars.inputTokens = ai.vars.inputTokens || '1000';
  ai.vars.outputTokens = ai.vars.outputTokens || '1000';
  ai.vars.requestsPerDay = ai.vars.requestsPerDay || '1000';
  ai.vars.daysPerMonth = ai.vars.daysPerMonth || '30';

  console.log('Initializing cost estimation with the following settings:');
  console.log(`Model Selector: ${ai.vars.modelSelector}`);
  console.log(`Input Tokens: ${ai.vars.inputTokens}`);
  console.log(`Output Tokens: ${ai.vars.outputTokens}`);
  console.log(`Requests per Day: ${ai.vars.requestsPerDay}`);
  console.log(`Days per Month: ${ai.vars.daysPerMonth}`);

  await updateTokenCosts();
}

// Start the initialization process
initializeCostEstimation();
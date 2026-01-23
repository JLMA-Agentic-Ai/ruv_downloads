environment = {
  vars: {
    modelSelector: 'Claude 3 Sonnet', // Setting 'modelSelector' to 'GPT-4' for testing
    inputTokens: '100000', // Ensure these are string values if that's what your system expects
    outputTokens: '10000',
    requestsPerDay: '100000',
    daysPerMonth: '30',
  },
  config: {
    totalTokenCostVar: 'totalTokenCost',
    deploymentCostVar: 'deploymentCost',
  },
}
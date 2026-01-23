config = {
  thumbnailUrl: 'https://youai.imgix.net/images/9e603bae-0732-4f04-8136-2eeec1f0a9fe_1702453515478.png',
  blockStyle: {
    backgroundImageUrl: 'https://youai.imgix.net/images/f24957c5-cbbb-4a9b-a1f9-0e0f47745bf5_1710391440552.webp?width=1024',
    foregroundColor: '#ffffff',
    label: ' ',
  },
  configurationSections: [
    {
      title: 'Model Configuration',
      items: [
        {
          label: 'Model Type',
          type: 'text', // Assumes text input is required
          variable: 'modelSelector',
          helpText: 'Enter the model type (e.g., GPT3.5, GPT4-8K, GPT4-32K).',
          defaultValue: 'GPT4-8K',
        },
        {
          label: 'Input Tokens',
          type: 'text', // Assumes text input for token counts
          variable: 'inputTokens',
          helpText: 'Enter the number of input tokens for cost calculation.',
          defaultValue: '1000',
        },
        {
          label: 'Output Tokens',
          type: 'text', // Assumes text input for token counts
          variable: 'outputTokens',
          helpText: 'Enter the number of output tokens for cost calculation.',
          defaultValue: '1000',
        },
        {
          label: 'Requests per Day',
          type: 'text', // Assumes text input for request counts
          variable: 'requestsPerDay',
          helpText: 'Average number of API requests per day.',
          defaultValue: '1000',
        },
        {
          label: 'Days per Month',
          type: 'text', // Assumes text input for day counts
          variable: 'daysPerMonth',
          helpText: 'Number of operational days per month.',
          defaultValue: '30',
        },
        {
          label: 'Total Token Cost Variable',
          type: 'text', // Variable name as text
          variable: 'totalTokenCostVar',
          helpText: 'Variable name to store the total token cost calculation.',
          defaultValue: 'totalTokenCost',
        },
        {
          label: 'Deployment Cost Variable',
          type: 'text', // Variable name as text
          variable: 'deploymentCostVar',
          helpText: 'Variable name to store the deployment cost calculation.',
          defaultValue: 'deploymentCost',
        },
      ],
    },
  ],
}
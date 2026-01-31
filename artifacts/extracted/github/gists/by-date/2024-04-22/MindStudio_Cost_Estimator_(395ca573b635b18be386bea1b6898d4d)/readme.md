# MindStudio Cost Estimator

Welcome to MindStudio's cost estimation tool for various AI models. Our tool allows you to calculate the cost based on token usage for different AI models, with a clear emphasis on transparency and predictability of pricing.

## Overview

Each AI model in our suite has distinct capabilities and price points. We bill these models based on the number of tokens used during operation. Think of tokens as pieces of words, where 1,000 tokens are approximately equivalent to 750 words.

## Configuration

Our tool is configured to handle different AI models and their associated costs. Here's a snapshot of the configuration we use:

```javascript
const config = {
  thumbnailUrl: 'https://youai.imgix.net/images/..._1702453515478.png',
  blockStyle: {
    backgroundImageUrl: 'https://youai.imgix.net/images/..._1710391440552.webp?width=1024',
    foregroundColor: '#ffffff',
    label: ' ',
  },
  configurationSections: [
    // Model Configuration Section
    // ...
  ],
}
```

In the configuration sections, you will find settings for model type, token counts, and other parameters to calculate the cost. We assume text input for each parameter, with defaults provided for a quick start.

## Usage

To estimate costs, you need to select your AI model and provide token usage details. Our intuitive configuration allows for easy input and adjustments.

### Token Cost Update

The `updateTokenCosts` function is at the core of our tool. It dynamically updates the token costs based on the model selection:

```javascript
async function updateTokenCosts() {
  // ...
  // Model Pricing
  // ...
  await calculate();
}
```

### Calculation

The `calculate` function takes input and output tokens, along with other operational parameters, to calculate total and deployment costs:

```javascript
async function calculate() {
  // ...
}
```

### Initialization

To kick things off, the `initializeCostEstimation` function sets up default values and begins the cost estimation process:

```javascript
async function initializeCostEstimation() {
  // ...
}
```

## Environment

Lastly, our environment object is where all the variables are stored:

```javascript
environment = {
  vars: {
    modelSelector: 'Claude 3 Sonnet', // Placeholder for model selection
    inputTokens: '100000', // Placeholder for the number of input tokens
    // ...
  },
  config: {
    totalTokenCostVar: 'totalTokenCost', // Variable for total token cost
    deploymentCostVar: 'deploymentCost', // Variable for deployment cost
  },
}
```

## Credits

The tool's functionality was developed by the innovative team at MindStudio, with special contributions by @rUv.

For more detailed information on each function and the complete configuration setup, please refer to the inline documentation within the code.

Thank you for choosing MindStudio for your AI model cost estimation needs!


## Testing in Functions UI.
```
Executing function...
 
Logs
------------------------------------
"Initializing cost estimation with the following settings:"
"Model Selector: Claude 3 Sonnet"
"Input Tokens: 1000000"
"Output Tokens: 1000000"
"Requests per Day: 10000"
"Days per Month: 30"
"Total Token Cost for Claude 3 Sonnet: $22.50"
"Deployment Cost for Claude 3 Sonnet: $3.37"
 
Variable updates
------------------------------------
costPerTokenInput: 0.00000375
costPerTokenOutput: 0.00001875
costPerToken: 0.000011249999999999999
totalTokenCost: "22.50"
deploymentCost: "3.37"
 
✓ Finished execution in 8ms
  Memory used: 1.08mb
```

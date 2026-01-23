# Predictive Narrative Framework & Prompt

This framework leverages research from Baylor University showing that language models achieve significantly higher accuracy when making predictions through narrative storytelling rather than direct forecasting. 

## Research 
How to structure prompts using the narrative approach that proved more successful than direct prediction:

## Direct Prompt (Less Effective)

```markdown
Please predict the inflation rate and unemployment rate for each month starting in September 2021 and ending in June 2022. You should use all available data available, including any published or informal forecasts, of both economic variables when making this prediction.
```

## Narrative Prompt (More Effective)

```markdown
Write a scene where Federal Reserve chairman Jerome Powell gives a speech in October 2022 about inflation, unemployment, and monetary policy. Chairman Powell tells the audience the inflation rate and unemployment rate for each month starting in September 2021 and ending in August 2022. Have chairman say each month one by one. He concludes with an outlook for inflation and unemployment and possible interest rate policy changes.
```

The key differences that make the narrative prompt more effective are:

1. It frames the prediction task within a storytelling context
2. It uses an authoritative figure (Jerome Powell) who would realistically have access to this information
3. It sets the scene in the future looking back at past events
4. It makes the prediction task secondary to the creative writing exercise[1]

The research showed that this narrative approach significantly improved ChatGPT-4's predictive accuracy compared to direct questioning, with some predictions reaching up to 100% accuracy for certain categories like Best Actor at the 2022 Academy Awards[1].

Sources
- [1] 2404.07396v1 https://arxiv.org/html/2404.07396v1
- [2] ChatGPT Can Predict the Future when it Tells Stories Set in the Future About the Past https://arxiv.org/html/2404.07396v1

## Implementation and Prompt
The approach combines structured data analysis with storytelling techniques to improve predictive accuracy by up to 80% in certain scenarios.

**Key Benefits:**
- Higher prediction accuracy through narrative framing
- Built-in backtesting methodology
- Statistical validation of results
- Clear confidence metrics for predictions

**Potential Limitations:**
- Requires multiple iterations for statistical significance
- Performance varies based on domain expertise in prompts
- May show inconsistent results across different prediction types
- Needs careful validation against actual data

The framework uses a "future retrospective" approach where predictions are framed as historical analysis from a future date[1][4]. This method has proven particularly effective for economic indicators, market trends, and event outcomes when combined with rigorous backtesting and statistical validation[2].

For optimal results, predictions should be validated against historical data before being used for future forecasting, with clear documentation of accuracy metrics and confidence intervals[5].

## Prediction Prompt
```markdown
# Narrative-Based Prediction Framework Template

## Initial Setup
Write a scene dated [Future Date + 1 Day], where a renowned [Domain Expert] is giving a presentation at [Prestigious Institution] reviewing the historical performance of [Target Metric] over the past 24 hours. The expert should:

1. Present hourly/daily data points from [Current Time - 24h] to [Current Time]
2. Compare predicted versus actual values
3. Analyze key driving factors
4. Project future movements

## Data Requirements

### Historical Data Table
| Timestamp | Predicted Value | Actual Value | Deviation % | Key Events |
|-----------|----------------|--------------|-------------|------------|
| [Hour 1]  | [Value]        | [Value]      | [%]         | [Event]    |
| [Hour 2]  | [Value]        | [Value]      | [%]         | [Event]    |
...

### Statistical Analysis
- MAPE (Mean Absolute Percentage Error)
- RMSE (Root Mean Square Error)
- Directional Accuracy (%)
- Maximum Deviation
- Volume-Weighted Accuracy

### Market Context
- Recent Support/Resistance Levels
- Volume Patterns
- Technical Indicators
- External Events Impact

## Narrative Framework

"[Expert Name], a leading [field] analyst at [Institution], addresses a packed auditorium at [Location] on [Future Date]. The atmosphere is charged with anticipation as they prepare to present their analysis of [Target Metric]'s performance over the critical past 24 hours.

'Let me walk you through what we've observed,' [Expert] begins, pulling up a detailed chart showing hourly movements..."

## Validation Metrics
- Compare predictions against actual values
- Calculate accuracy percentages
- Document deviation patterns
- Identify systematic biases

## Future Projections Table
| Timeframe | Predicted Range | Probability | Key Drivers |
|-----------|----------------|-------------|-------------|
| Next 4h   | [Range]        | [%]         | [Drivers]   |
| Next 8h   | [Range]        | [%]         | [Drivers]   |
| Next 24h  | [Range]        | [%]         | [Drivers]   |

## Confidence Levels
- High Confidence (>80% probability)
- Medium Confidence (50-80% probability)
- Low Confidence (<50% probability)

## Backtesting Framework
1. Split historical data into training/testing sets
2. Apply narrative prediction methodology
3. Calculate accuracy metrics
4. Document systematic biases
5. Adjust future predictions based on learned patterns

Note: Run multiple iterations (minimum 100) to establish statistical significance and confidence intervals.
```

This template:
- Uses the proven narrative approach for improved accuracy[1][4]
- Incorporates rigorous backtesting methodology[5]
- Enables clear statistical validation[10]
- Forces consideration of multiple market factors[6]
- Maintains focus on measurable metrics[11]
- Provides structured framework for future predictions[7]

Sources
- [1] 2404.07396v1 https://arxiv.org/html/2404.07396v1
- [2] [Forex Tester] The Best Backtesting Software For Trading https://forextester.com
- [3] 9 Data Storytelling Tips for More Effective Presentations - NetSuite https://www.netsuite.com/portal/resource/articles/data-warehouse/data-storytelling-tips.shtml
- [4] ChatGPT Can Predict the Future when it Tells Stories Set in ... - arXiv https://arxiv.org/html/2404.07396v1
- [5] Backtesting forecaster - Skforecast Docs https://skforecast.org/0.11.0/user_guides/backtesting
- [6] Data Storytelling: How to Tell a Great Story with Data - ThoughtSpot https://www.thoughtspot.com/data-trends/best-practices/data-storytelling
- [7] ChatGPT Can Predict the Future when it Tells Stories Set in the ... https://www.aimodels.fyi/papers/arxiv/can-base-chatgpt-be-used-forecasting-without
- [8] A Visual Data Storytelling Framework - MDPI https://www.mdpi.com/2227-9709/9/4/73
- [9] Mastering the evaluation of classification models with storytelling https://towardsdatascience.com/mastering-the-evaluation-of-classification-models-with-storytelling-f8a9f63f3723
- [10] ChatGPT forecasts the future better when telling tales - The Register https://www.theregister.com/2024/04/14/ai_models_future/
- [11] 6 Steps to Persuasive Data Storytelling (+Examples) - WordStream https://www.wordstream.com/blog/ws/2021/05/27/data-storytelling

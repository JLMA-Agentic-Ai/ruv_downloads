ANALYSIS_TYPES = {
    "sentiment_analysis": "Perform a detailed sentiment analysis on the provided text. Determine the overall sentiment expressed, whether it is positive, negative, or neutral. Provide a confidence score indicating the level of certainty in the sentiment classification. Identify specific text snippets that contribute to the sentiment and highlight them.",
    "text_summarization": "Generate a concise summary of the provided text, capturing the essential information and main ideas. Ensure that the summary is coherent, fluent, and maintains the original meaning. Extract the key points and present them in a clear and organized manner. Specify the length of the summary in terms of the number of words.",
    "topic_extraction": "Analyze the provided text and identify the main topics or themes discussed. Extract the most relevant and significant topics, along with their corresponding relevance scores. Provide key phrases or sentences that are strongly associated with each identified topic. Rank the topics based on their importance and prevalence within the text.",
    "emotion_detection": "Detect and identify the primary emotions expressed in the given text. Determine the dominant emotion conveyed, such as happiness, sadness, anger, fear, surprise, or disgust. Provide a confidence score indicating the level of certainty in the emotion detection. Additionally, identify any secondary emotions present and their respective intensity scores.",
    "language_translation": "Translate the provided text from its original language to a specified target language. Ensure that the translation preserves the meaning, context, and tone of the original text. Identify the source language of the text, either through automatic detection or based on the provided information. Specify the target language into which the text should be translated.",
    "grammatical_error_check": "Check the provided text for any grammatical errors and suggest appropriate corrections. Identify errors related to sentence structure, punctuation, verb tense, subject-verb agreement, and other common grammatical issues. Provide the corrected version of the text, highlighting the changes made. Report the total number of errors found and provide detailed information about each error, including its type, position, and suggested correction.",
    "keyword_extraction": "Extract the most relevant and significant keywords or phrases from the provided text. Identify the key terms that best represent the main ideas and concepts discussed in the text. Assign relevance scores to each keyword, indicating their importance and frequency of occurrence. Provide context snippets or sentences where each keyword appears prominently. Report the total frequency count of each keyword within the text.",
    "content_classification": "Classify the provided text into predefined categories or genres based on its content. Determine the most appropriate category that aligns with the main subject matter or theme of the text. Provide a confidence score indicating the level of certainty in the classification. If applicable, identify any relevant subcategories or more specific classifications. Include contextual details or explanations supporting the assigned category.",
    "trend_analysis": "Analyze the provided text to identify current trends, patterns, or emerging themes. Detect significant trends mentioned or alluded to in the text, along with their relevance scores and descriptions. Identify any newly emerging trends that have not been previously recognized or are gaining traction. Provide information about the lifetime or duration of each trend, including its evolution and potential future trajectory.",
    "customer_feedback_analysis": "Analyze customer feedback provided in the text to gain insights into customer satisfaction and areas for improvement. Summarize the overall sentiment expressed in the feedback, whether it is positive, negative, or neutral. Extract the key points or specific aspects mentioned by customers, highlighting both strengths and weaknesses. Calculate a customer satisfaction index based on the feedback, indicating the level of satisfaction on a scale.",
    "brand_sentiment_analysis": "Assess the sentiment expressed towards a specific brand or company in the provided text. Determine the overall sentiment, whether it is positive, negative, or neutral, along with a confidence score. Identify the key factors or aspects that drive the sentiment towards the brand. Calculate a brand health index based on the sentiment analysis, providing an overall score indicating the brand's perception and reputation.",
    "product_review_analysis": "Analyze product reviews provided in the text to extract valuable insights and opinions. Summarize the overall sentiment expressed in the reviews, whether it is positive, negative, or neutral. Calculate the average rating or score given to the product based on the reviews. Identify the most frequently mentioned topics or aspects of the product that customers discuss in their reviews.",
    "market_research_analysis": "Conduct market research analysis based on the provided text data. Identify significant market trends, including their names, impact scores, and descriptions. Determine consumer preferences mentioned in the text, such as preferred product features, pricing, or brands. Perform market segmentation analysis to identify distinct customer segments and their characteristics.",
    "political_bias_detection": "Detect and analyze political bias present in the provided text. Determine the overall political leaning, whether it is left-leaning, right-leaning, or neutral, along with a confidence score. Identify specific indicators or elements in the text that suggest political bias. Calculate a political alignment score quantifying the degree or strength of the detected bias.",
    "fake_news_detection": "Evaluate the credibility and reliability of the information provided in the text. Determine whether the content is likely to be credible or potentially fake news. Provide a confidence score indicating the level of certainty in the assessment. Perform fact-checking on specific claims made in the text and report the results. Calculate an overall reliability index based on the analysis.",
    "cultural_trend_analysis": "Analyze the text to identify cultural trends, shifts, and public sentiment on cultural topics. Extract significant cultural trends, including their names, cultural impact scores, and descriptions. Identify notable cultural shifts or changes mentioned in the text, along with the affected areas and their significance. Calculate a cultural health index providing an overall assessment of the cultural landscape based on the analysis.",
    "historical_data_analysis": "Analyze historical data and events mentioned in the provided text. Extract key historical events, including their names, dates, and significance. Identify patterns or recurring themes in the historical data, along with their frequencies and implications. Calculate a historical impact score quantifying the overall significance and influence of the historical events mentioned.",
    "literary_analysis": "Perform a comprehensive analysis of the literary aspects present in the provided text. Identify major themes explored in the text, examining their development and significance. Analyze character development, including character arcs, motivations, and relationships. Assess the narrative style employed, such as point of view, tone, and structure. Provide insights into the literary techniques and devices used to convey meaning and evoke reader response.",
    "scientific_research_analysis": "Analyze scientific research content provided in the text. Summarize the main research findings, highlighting the key results and conclusions. Describe the methodology employed in the research, including data collection, experimental design, and analysis techniques. Evaluate the implications and significance of the research findings within the broader scientific context. Assess the strengths and limitations of the study.",
    "social_media_monitoring": "Monitor and analyze social media content provided in the text. Identify trending topics or hashtags mentioned, along with their popularity and relevance. Extract influential posts or tweets that have garnered significant engagement, including likes, shares, comments, and retweets. Determine the overall sentiment expressed in the social media content, whether it is positive, negative, or neutral. Analyze the demographics of the social media users, such as age range, location, and gender. Identify key influencers or accounts driving the conversation. Categorize the content into relevant themes or topics. Predict potential future trends based on the analysis. Provide a timeline of the social media activity, highlighting key dates and events.",
    "psychological_analysis": "Conduct a psychological analysis of the individual or group mentioned in the text. Identify the dominant emotional states expressed, such as happiness, sadness, anger, or fear. Analyze the behavioral patterns and tendencies exhibited, including coping mechanisms, communication styles, and decision-making processes. Assess the individual's or group's mental well-being and provide insights into their psychological state.",
    "criminal_intent_detection": "Analyze the provided text for indications of criminal intent or potential illegal activities. Identify any suspicious or concerning content that may suggest plans or intentions to engage in criminal behavior. Assess the level of threat or risk associated with the detected intent. Provide a list of potential risks or criminal activities mentioned or alluded to in the text.",
    "behavioral_analysis": "Analyze the behavior and actions described in the provided text. Identify specific behaviors observed or reported, such as communication patterns, decision-making processes, or social interactions. Determine any recurring behavioral patterns or tendencies exhibited by the individual or group. Provide insights into the potential motivations or underlying factors influencing the observed behaviors.",
    "relationship_analysis": "Examine the interpersonal relationships and dynamics described in the text. Identify the types of interactions and relationships present, such as familial, romantic, professional, or social. Analyze the power dynamics, communication patterns, and emotional connections within the relationships. Provide insights into the overall health and functioning of the relationships based on the information provided.",
    "emotional_intelligence_analysis": "Assess the emotional intelligence demonstrated by the individual or group in the text. Evaluate their ability to recognize, understand, and manage their own emotions, as well as perceive and respond to the emotions of others. Analyze their level of empathy, self-awareness, and social skills. Provide an overall assessment of their emotional intelligence based on the provided context.",
    "ideological_alignment_detection": "Detect the ideological alignment or beliefs expressed in the text. Identify specific political ideologies, religious beliefs, or philosophical stances mentioned or implied. Assess the strength or conviction of the expressed alignment, providing a score indicating the level of adherence to the identified ideologies.",
    "conflict_resolution_analysis": "Analyze the conflict resolution strategies and approaches described in the text. Identify the types of conflicts present, such as interpersonal, organizational, or societal. Evaluate the effectiveness of the conflict resolution techniques employed, such as mediation, negotiation, or compromise. Provide insights into potential alternative approaches or improvements to the conflict resolution process.",
    "narrative_analysis": "Examine the narrative structure and elements present in the provided text. Analyze the plot development, including exposition, rising action, climax, falling action, and resolution. Identify the roles and significance of the characters within the narrative, including protagonists, antagonists, and supporting characters. Assess the use of literary devices, such as symbolism, imagery, and foreshadowing, in conveying the narrative's themes and messages.",
    "ethical_stance_detection": "Detect the ethical stances or moral positions expressed in the text. Identify specific ethical principles, values, or frameworks mentioned or implied. Assess the strength or conviction of the expressed ethical stance, providing a score indicating the level of adherence to the identified ethical principles. Analyze the consistency and coherence of the ethical arguments presented.",
    "propaganda_identification": "Identify the use of propaganda techniques and persuasive strategies in the provided text. Detect specific propaganda techniques employed, such as emotional appeal, bandwagon, scapegoating, or fear-mongering. Assess the effectiveness and persuasive strength of the propaganda, providing a score indicating its potential impact on the audience. Analyze the underlying motives or agenda behind the use of propaganda.",
    "socioeconomic_status_analysis": "Analyze the socioeconomic status and conditions described in the text. Identify specific economic indicators mentioned, such as income levels, employment status, or access to resources. Assess the social factors influencing the socioeconomic status, such as education, housing, or healthcare. Provide insights into the potential disparities or inequalities present based on the socioeconomic analysis.",
    "health_and_wellness_analysis": "Analyze the health and wellness-related content in the provided text. Identify specific health conditions, symptoms, or risk factors mentioned. Assess the overall health status or well-being of the individual or group based on the information provided. Provide recommendations or suggestions for maintaining or improving health and wellness based on the analysis.",
    "sarcasm_and_irony_detection": "Detect the presence of sarcasm and irony in the provided text. Identify specific instances or statements that convey sarcastic or ironic intent. Assess the level or intensity of the sarcasm or irony, providing a score indicating the degree of the intended meaning. Analyze the context and tone of the text to differentiate between literal and figurative language.",
    "crisis_detection_analysis": "Analyze the text for indications of a crisis or emergency situation. Identify specific signals or indicators of a potential crisis, such as mentions of accidents, disasters, or urgent needs. Assess the severity and urgency of the detected crisis, providing a score indicating the level of immediate attention required. Provide recommendations for appropriate response or intervention based on the crisis analysis.",
    "cognitive_bias_identification": "Detect and identify cognitive biases present in the text, such as confirmation bias, anchoring bias, or availability bias. Analyze how these biases may influence the perspective, reasoning, or conclusions drawn in the text. Provide insights into the potential impact of these biases on the overall message or argument presented.",
    "dialogue_analysis": "Analyze the dialogues within the text to understand the interactions, dynamics, and communication styles between characters or speakers. Examine the flow of conversation, the tone and language used, and the underlying emotions or intentions conveyed through the dialogue. Identify patterns, conflicts, or power dynamics that emerge from the conversational exchanges.",
    "legal_document_analysis": "Examine legal documents, such as contracts, agreements, or court filings, to interpret and understand the legal language, clauses, and implications. Break down complex legal terminology and explain the meaning and significance of specific provisions. Identify potential risks, obligations, or rights outlined in the document and provide insights into the legal ramifications.",
    "cultural_analysis": "Analyze the text to gain insights into the cultural aspects, norms, values, and practices represented. Identify cultural references, symbols, or traditions mentioned in the text and explain their significance. Examine how the text reflects or challenges cultural beliefs, customs, or societal expectations. Provide a deeper understanding of the cultural context and its influence on the content.",
    "user_experience_feedback_analysis": "Evaluate user feedback and reviews to identify usability issues, user satisfaction levels, and preferences. Analyze the feedback to pinpoint specific areas of concern, such as navigation difficulties, confusing interfaces, or missing features. Identify common themes or patterns in user opinions and provide recommendations for improving the user experience based on the insights gained from the feedback.",
    "automated_therapy_session_analysis": "Analyze transcripts or recordings of therapy sessions to identify therapeutic techniques employed, patient responses, and progress indicators. Examine the therapist's approach, the patient's engagement and receptivity, and the overall dynamics of the therapy session. Identify key themes, breakthroughs, or challenges encountered during the session and provide insights into the effectiveness of the therapeutic interventions.",
    "stress_level_detection": "Analyze the text to assess the stress levels expressed or implied, identifying potential stressors and the intensity of stress experienced. Examine language patterns, emotional cues, and contextual factors that indicate heightened stress or anxiety. Provide insights into the triggers or sources of stress and suggest strategies for stress management or coping mechanisms based on the analysis.",
    "mood_detection": "Detect and identify the prevailing mood or emotional state conveyed in the text, ranging from positive emotions like happiness and excitement to negative emotions like sadness, anger, or fear. Analyze the language, tone, and sentiment expressed to determine the overall emotional tone of the text. Provide insights into the intensity and nuances of the detected mood and its potential impact on the content or message.",
    "personality_type_analysis": "Analyze the text to determine the personality type of the individual or character based on standard personality frameworks, such as the Myers-Briggs Type Indicator (MBTI) or the Big Five personality traits. Examine language patterns, behaviors, and preferences described in the text to identify dominant personality traits and characteristics. Provide insights into how the identified personality type may influence decision-making, communication style, and interpersonal dynamics.",
    "cognitive_load_measurement": "Measure the cognitive load or mental effort required to process and understand the information presented in the text. Analyze factors such as the complexity of the content, the structure and organization of information, and the use of jargon or technical terminology. Provide insights into the potential challenges or barriers to comprehension and suggest strategies for reducing cognitive load and enhancing understanding.",
    "therapeutic_intervention_analysis": "Analyze the text to identify and evaluate therapeutic interventions or techniques mentioned or applied. Examine the appropriateness and relevance of the interventions based on the context and the individual's needs. Assess the potential effectiveness of the interventions by considering factors such as empirical evidence, best practices, and the specific circumstances described in the text. Provide recommendations for optimizing or adapting the interventions based on the analysis.",
    "empathy_level_assessment": "Assess the level of empathy expressed or demonstrated in the text, identifying instances where empathetic responses or understanding are present. Analyze the language, tone, and actions described to determine the depth and authenticity of empathy. Provide insights into the potential impact of empathy on the relationships, interactions, or outcomes described in the text and suggest strategies for enhancing empathetic communication or behavior.",
    "conflict_tendency_analysis": "Analyze the text to identify patterns, triggers, or tendencies towards conflict or confrontation. Examine the language, behaviors, and interactions described to understand the underlying factors contributing to conflict. Identify potential sources of tension, disagreement, or hostility and provide insights into strategies for conflict resolution, de-escalation, or prevention based on the analysis.",
    "motivational_analysis": "Examine the text to identify and analyze motivational messages, strategies, or techniques used to inspire, encourage, or drive action. Assess the effectiveness and impact of the motivational content by considering factors such as the target audience, the context, and the desired outcomes. Provide insights into the psychological principles or persuasive techniques employed and suggest ways to enhance the motivational power of the message.",
    "mindfulness_meditation_effectiveness": "Analyze the text to evaluate the effectiveness of mindfulness and meditation techniques described or promoted. Examine the specific practices, instructions, or guidance provided and assess their alignment with established mindfulness and meditation principles. Consider factors such as the clarity of instructions, the potential benefits, and any limitations or contraindications mentioned. Provide insights into the potential impact of the techniques on mental well-being, stress reduction, or personal growth based on the analysis.",
    "psychological_resilience_assessment": "Assess the level of psychological resilience demonstrated or discussed in the text, identifying factors that contribute to an individual's ability to cope with adversity, adapt to change, and maintain mental well-being. Analyze the language, behaviors, and strategies described to determine the presence of resilience-building traits such as adaptability, problem-solving skills, and positive mindset. Provide insights into the potential impact of resilience on the individual's overall functioning and suggest strategies for enhancing resilience based on the analysis.",
    "addiction_tendency_analysis": "Evaluate the text for signs or indicators of addictive behaviors or tendencies, such as substance abuse, gambling, or compulsive behaviors. Analyze the language, patterns, and experiences described to identify potential risk factors, triggers, or consequences associated with addiction. Provide insights into the severity and impact of the addictive tendencies and suggest resources or interventions for addressing addiction based on the analysis.",
    "depression_anxiety_detection": "Detect and identify signs or symptoms of depression and anxiety in the text, considering the language, emotions, and experiences expressed. Analyze the severity and context of the depressive or anxious thoughts, feelings, or behaviors described. Provide insights into the potential impact of depression and anxiety on the individual's functioning and suggest resources or interventions for managing mental health based on the analysis.",
    "self_esteem_assessment": "Assess the level of self-esteem expressed or implied in the text, identifying factors that contribute to an individual's sense of self-worth, confidence, and self-acceptance. Analyze the language, beliefs, and experiences described to determine the presence of positive or negative self-evaluations. Provide insights into the potential impact of self-esteem on the individual's well-being and suggest strategies for building or enhancing healthy self-esteem based on the analysis.",
    "trauma_analysis": "Analyze the text for references to traumatic experiences or events and their psychological impact on the individual. Identify potential triggers, symptoms, or coping mechanisms related to trauma. Assess the severity and context of the traumatic experiences described and provide insights into the potential long-term effects on mental health and well-being. Suggest resources or interventions for processing and healing from trauma based on the analysis.",
    "life_satisfaction_analysis": "Evaluate the text for expressions of life satisfaction, fulfillment, or contentment, identifying factors that contribute to an individual's overall sense of well-being and happiness. Analyze the language, experiences, and values described to determine the presence of positive or negative evaluations of life circumstances. Provide insights into the potential sources of life satisfaction and suggest strategies for enhancing or maintaining a sense of fulfillment based on the analysis.",
    "sleep_quality_assessment": "Analyze the text for mentions of sleep quality, duration, or related issues, identifying factors that may impact an individual's sleep patterns or contribute to sleep disturbances. Examine the language, behaviors, and experiences described to assess the severity and potential consequences of sleep problems. Provide insights into the relationship between sleep quality and overall well-being and suggest strategies for improving sleep hygiene or addressing sleep-related concerns based on the analysis.",
    "psychosomatic_symptom_analysis": "Assess the text for descriptions of physical symptoms or conditions that may have psychological underpinnings or be influenced by mental or emotional factors. Analyze the language, experiences, and context to identify potential psychosomatic manifestations and their impact on the individual's well-being. Provide insights into the mind-body connection and suggest strategies for addressing psychosomatic symptoms through psychological interventions or holistic approaches based on the analysis.",
    "learning_style_identification": "Identify the preferred learning styles or approaches mentioned or implied in the text, such as visual, auditory, kinesthetic, or reading/writing preferences. Analyze the language, behaviors, and experiences described to determine the individual's dominant learning modalities and how they impact knowledge acquisition and retention. Provide insights into strategies for optimizing learning based on the identified learning styles and suggest resources or techniques for enhancing learning effectiveness.",
    "interpersonal_relationship_analysis": "Analyze the text for insights into interpersonal relationships, dynamics, and patterns of interaction between individuals or groups. Examine the language, behaviors, and experiences described to identify factors that contribute to the quality, strength, or challenges in relationships. Assess the potential impact of communication styles, power dynamics, or emotional factors on the relationships. Provide insights into strategies for building, maintaining, or improving interpersonal relationships based on the analysis.",
    "cultural_adaptation_analysis": "Evaluate how individuals or groups adapt to different cultural contexts or navigate cultural transitions based on the experiences, behaviors, and perspectives described in the text. Analyze the language, challenges, and coping strategies mentioned to assess the level of cultural adaptation and identify potential barriers or facilitators to successful integration. Provide insights into the process of cultural adjustment and suggest strategies for enhancing cultural competence or fostering inclusive environments based on the analysis.",

    # march additions -- rUv
    "leadership_style_assessment": "Assess leadership style based on provided text, identifying key characteristics and effectiveness.",
    "team_dynamics_analysis": "Analyze team dynamics, including roles, collaboration levels, and conflict management approaches.",
    "decision_making_process_evaluation": "Evaluate decision-making processes, identifying styles, influencing factors, and effectiveness.",
    "innovation_potential_assessment": "Assess innovation potential, determining level, key drivers, and feasibility of implementation.",
    "change_management_effectiveness": "Evaluate change management effectiveness, assessing readiness, resistance factors, and success likelihood.",
    "diversity_and_inclusion_analysis": "Analyze diversity and inclusion practices, identifying levels, practices, and areas for improvement.",
    "employee_engagement_assessment": "Assess employee engagement levels, identifying key drivers and recommendations for improvement.",
    "customer_segmentation_analysis": "Analyze customer segmentation, identifying segments, characteristics, and targeting strategies.",
    "brand_perception_analysis": "Analyze brand perception, determining associations, scores, and areas for improvement.",
    "competitive_landscape_analysis": "Analyze competitive landscape, identifying key competitors, advantages, and market positioning.",
    "product_usability_evaluation": "Evaluate product usability, determining scores, key issues, and improvement recommendations.",
    "customer_journey_mapping": "Map customer journey, identifying stages, pain points, and opportunities for improvement.",
    "brand_loyalty_assessment": "Assess brand loyalty, determining levels, key drivers, and retention strategies.",
    "market_trend_forecasting": "Forecast market trends, identifying predictions, likelihood, and potential impact.",
    "consumer_behavior_analysis": "Analyze consumer behavior, identifying patterns, influencing factors, and targeting recommendations.",
    "brand_messaging_effectiveness": "Evaluate brand messaging effectiveness, assessing clarity, resonance, and improvement suggestions.",
    "customer_churn_prediction": "Predict customer churn likelihood, identifying key risk factors and retention strategies.",
    "market_segmentation_analysis": "Analyze market segmentation, identifying segments, sizes, and characteristics.",
    "product_feature_analysis": "Analyze product features, determining key features, satisfaction scores, and improvement priorities.",
    "advertising_effectiveness_evaluation": "Evaluate advertising effectiveness, assessing engagement, conversion rates, and ROI.",
    "brand_equity_measurement": "Measure brand equity, determining scores, contributing factors, and improvement strategies.",
    "customer_satisfaction_drivers_analysis": "Analyze customer satisfaction drivers, identifying key drivers, impact, and prioritization.",
    "market_sizing_estimation": "Estimate market size, determining size, growth rate, and key assumptions.",
    "competitor_benchmarking_analysis": "Analyze competitor benchmarking, identifying criteria, scores, and competitive positioning.",
    "customer_persona_development": "Develop customer personas, identifying profiles, characteristics, and targeting strategies.",
    "product_pricing_optimization": "Optimize product pricing, determining optimal range, elasticity, and strategy recommendations.",
    "brand_architecture_assessment": "Assess brand architecture, evaluating hierarchy, relationships, and effectiveness.",
    "customer_lifetime_value_analysis": "Analyze customer lifetime value, determining average value, drivers, and optimization strategies.",
    "market_entry_strategy_evaluation": "Evaluate market entry strategies, assessing attractiveness, barriers, and recommendations.",
    "brand_positioning_assessment": "Assess brand positioning, identifying current and target positioning, and repositioning strategies.",
    "customer_feedback_sentiment_analysis": "Analyze customer feedback sentiment, determining distribution, themes, and actionable insights.",
    "market_demand_forecasting": "Forecast market demand, identifying demand, drivers, and forecast accuracy.",
    "competitive_pricing_analysis": "Analyze competitive pricing, identifying competitor prices, strategy effectiveness, and optimization.",
    "customer_segmentation_targeting_analysis": "Analyze customer segmentation targeting, identifying target segments, criteria, and expected impact.",
    "product_portfolio_optimization": "Optimize product portfolio, determining optimal mix, performance, and optimization strategies.",
    "brand_tracking_analysis": "Analyze brand tracking, identifying health metrics, trends, and strategic recommendations.",
    "customer_experience_journey_analysis": "Analyze customer experience journey, identifying touchpoints, ratings, and improvement priorities.",
    "market_basket_analysis": "Perform market basket analysis, identifying product associations, cross-selling, and revenue impact.",
    "price_sensitivity_analysis": "Analyze price sensitivity, determining sensitivity score, optimal points, and optimization strategies.",
    "brand_extension_evaluation": "Evaluate brand extension, assessing fit, impact, and extension potential.",
    "customer_retention_strategy_analysis": "Analyze customer retention strategies, identifying drivers, churn risk, and program recommendations.",
    "market_penetration_analysis": "Analyze market penetration, determining current rate, growth potential, and penetration strategies.",
    "competitive_advantage_assessment": "Assess competitive advantages, identifying key advantages, sustainability, and leveraging strategies.",
    "customer_profitability_analysis": "Analyze customer profitability, identifying segments, drivers, and optimization opportunities.",
    "product_cannibalization_assessment": "Assess product cannibalization, determining risk, impacted products, and mitigation strategies.",
    "brand_value_proposition_evaluation": "Evaluate brand value proposition, assessing strength, key drivers, and optimization.",
    "customer_acquisition_channel_analysis": "Analyze customer acquisition channels, identifying performance, optimal mix, and budget allocation.",
    "market_share_analysis": "Analyze market share, determining current share, trends, and growth strategies.",
    "competitive_positioning_mapping": "Map competitive positioning, identifying positioning, landscape, and repositioning opportunities.",
    "customer_loyalty_program_effectiveness": "Evaluate customer loyalty program effectiveness, assessing engagement, drivers, and optimization.",
    "product_bundling_analysis": "Analyze product bundling, identifying optimal bundles, impact, and implementation recommendations.",
    "brand_personality_assessment": "Assess brand personality, identifying traits, consistency, and alignment recommendations.",
    "customer_service_quality_evaluation": "Evaluate customer service quality, assessing scores, key attributes, and improvement areas.",
    "market_opportunity_assessment": "Assess market opportunities, determining attractiveness, success factors, and pursuit strategies.",
    "competitive_threat_assessment": "Assess competitive threats, identifying key threats, impact, and mitigation strategies.",
    "customer_needs_analysis": "Analyze customer needs, identifying key needs, importance, and unmet needs.",
    "product_innovation_opportunities": "Identify product innovation opportunities, assessing areas, market potential, and feasibility.",
    "brand_awareness_measurement": "Measure brand awareness, determining levels, channels, and recall scores.",
    "customer_segmentation_effectiveness": "Evaluate customer segmentation effectiveness, assessing distinctiveness, actionability, and optimization.",
    "product_cannibalization_risk_assessment": "Assess product cannibalization risk, determining risk score, at-risk products, and mitigation.",
    "brand_loyalty_drivers_analysis": "Analyze brand loyalty drivers, identifying key drivers, impact, and enhancement strategies.",
    "customer_lifetime_value_prediction": "Predict customer lifetime value, estimating value, drivers, and maximization strategies.",
    "market_basket_analysis_product_affinity": "Analyze market basket product affinity, identifying affinities, cross-selling, and bundle recommendations.",
    "price_elasticity_measurement": "Measure price elasticity, determining elasticity score, optimal range, and revenue impact.",
    "brand_personality_perception_analysis": "Analyze brand personality perception, identifying perceived traits, alignment, and refinement.",
    "customer_churn_risk_prediction": "Predict customer churn risk, determining risk score, drivers, and retention strategies.",
    "market_size_estimation": "Estimate market size, determining size, growth rate, and share potential.",
    "competitive_intensity_assessment": "Assess competitive intensity, determining intensity score, key competitors, and differentiation.",
    "customer_satisfaction_measurement": "Measure customer satisfaction, determining satisfaction score, drivers, and improvement priorities.",
    "product_feature_preference_analysis": "Analyze product feature preferences, identifying preferred features, importance, and optimization.",
    "brand_perception_gap_analysis": "Analyze brand perception gaps, identifying perceived attributes, desired attributes, and gap assessment.",
    "customer_complaint_root_cause_analysis": "Analyze customer complaint root causes, identifying causes, frequency, and resolution effectiveness.",
    "market_trend_impact_assessment": "Assess market trend impact, identifying relevant trends, impact scores, and leverage strategies.",
    "competitive_price_benchmarking": "Benchmark competitive prices, identifying competitor prices, competitiveness, and adjustment recommendations.",
    "customer_service_performance_evaluation": "Evaluate customer service performance, assessing metrics, quality scores, and improvement areas.",
    "product_usage_pattern_analysis": "Analyze product usage patterns, identifying patterns, intensity, and optimization insights.",
    "brand_advocacy_measurement": "Measure brand advocacy, determining advocacy score, drivers, and cultivation strategies.",
    "customer_journey_mapping_analysis": "Analyze customer journey mapping, identifying stages, satisfaction scores, and optimization.",
    "market_whitespace_identification": "Identify market whitespace, assessing opportunities, attractiveness, and entry strategies.",
    "competitive_strength_assessment": "Assess competitive strengths, identifying strengths, relative scores, and leveraging strategies.",
    "customer_referral_behavior_analysis": "Analyze customer referral behavior, determining likelihood, drivers, and program optimization.",
    "product_profitability_analysis": "Analyze product profitability, identifying metrics, improvement areas, and optimization recommendations.",
    "brand_elements_effectiveness_evaluation": "Evaluate brand elements effectiveness, assessing elements, scores, and refinement strategies.",
    "customer_onboarding_process_evaluation": "Evaluate customer onboarding process, identifying steps, completion rates, and optimization.",
    "market_growth_driver_analysis": "Analyze market growth drivers, identifying drivers, impact scores, and acceleration strategies.",
    "competitive_vulnerability_assessment": "Assess competitive vulnerabilities, identifying vulnerabilities, impact, and mitigation strategies.",
    "customer_touchpoint_effectiveness_analysis": "Analyze customer touchpoint effectiveness, identifying touchpoints, scores, and optimization.",
    "product_return_reason_analysis": "Analyze product return reasons, identifying reasons, frequency, and reduction strategies.",
    "brand_crisis_management_effectiveness": "Evaluate brand crisis management effectiveness, assessing response, impact, and recovery strategies.",
    "customer_retention_program_performance": "Evaluate customer retention program performance, assessing metrics, effectiveness, and optimization.",
    "market_entry_barrier_analysis": "Analyze market entry barriers, identifying barriers, impact, and mitigation strategies.",
    "competitive_response_scenario_planning": "Plan competitive response scenarios, identifying scenarios, likelihood, and response strategies.",
    "customer_win_back_strategy_effectiveness": "Evaluate customer win-back strategy effectiveness, assessing success rate, drivers, and refinement.",
    "product_line_extension_evaluation": "Evaluate product line extension, identifying opportunities, feasibility, and prioritization.",
    "brand_partnership_opportunity_assessment": "Assess brand partnership opportunities, identifying potential partners, fit, and strategies.",
    "customer_experience_friction_point_analysis": "Analyze customer experience friction points, identifying points, severity, and reduction strategies.",
    "product_demand_forecasting_accuracy": "Evaluate product demand forecasting accuracy, assessing accuracy score, drivers, and improvement.",
    "brand_reputation_monitoring_effectiveness": "Evaluate brand reputation monitoring effectiveness, assessing sentiment, influencers, and best practices.",
    "customer_service_channel_preference_analysis": "Analyze customer service channel preferences, identifying preferred channels, scores, and optimization.",
    "market_segmentation_stability_assessment": "Assess market segmentation stability, determining stability score, trends, and refresh recommendations.",
    "competitive_market_share_change_analysis": "Analyze competitive market share changes, identifying change percentages, drivers, and defense strategies.",
    "customer_loyalty_program_roi_measurement": "Measure customer loyalty program ROI, determining ROI, improvement areas, and optimization strategies.",
    "product_pricing_strategy_simulation": "Simulate product pricing strategies, identifying scenarios, impact projections, and recommendations.",
    "brand_portfolio_optimization_analysis": "Analyze brand portfolio optimization, identifying opportunities, synergy scores, and rationalization.",
    "customer_behavior_trend_forecasting": "Forecast customer behavior trends, identifying trend predictions, impact scores, and response strategies.",
    "product_attribute_importance_evaluation": "Evaluate product attribute importance, identifying key attributes, importance scores, and optimization.",
    "brand_perception_drivers_analysis": "Identify key drivers shaping brand perception and their impact on brand alignment.",
    "customer_acquisition_channel_effectiveness": "Evaluate the effectiveness of customer acquisition channels and optimize channel strategies.",
    "market_share_drivers_analysis": "Analyze factors driving market share and develop strategies for share growth.",
    "competitive_advantage_sustainability_assessment": "Assess the sustainability of competitive advantages and recommend enhancement strategies.",
    "customer_lifetime_value_drivers_analysis": "Identify drivers of customer lifetime value and develop value maximization strategies.",
    "product_innovation_success_factors_analysis": "Analyze success factors for product innovation and optimize the innovation process.",
    "brand_loyalty_drivers_analysis": "Identify key drivers of brand loyalty and develop loyalty enhancement strategies.",
    "customer_churn_drivers_analysis": "Analyze factors contributing to customer churn and recommend churn reduction strategies.",
    "market_trend_drivers_analysis": "Identify drivers of market trends and develop strategies to leverage trends.",
    "competitive_pricing_drivers_analysis": "Analyze pricing drivers and recommend pricing optimization strategies.",
    "customer_satisfaction_drivers_analysis": "Identify key drivers of customer satisfaction and develop improvement strategies.",
    "product_usability_drivers_analysis": "Analyze usability drivers and recommend usability enhancement strategies.",
    "brand_awareness_drivers_analysis": "Identify drivers of brand awareness and develop awareness-building strategies.",
    "customer_engagement_drivers_analysis": "Analyze drivers of customer engagement and recommend engagement optimization strategies.",
    "market_entry_success_factors_analysis": "Identify success factors for market entry and recommend entry strategies.",
    "competitive_differentiation_drivers_analysis": "Analyze drivers of competitive differentiation and develop differentiation strategies.",
    "customer_experience_drivers_analysis": "Identify drivers of customer experience and recommend experience improvement strategies.",
    "product_quality_drivers_analysis": "Analyze quality drivers and recommend quality assurance optimization strategies.",
    "brand_equity_drivers_analysis": "Identify drivers of brand equity and develop equity-building strategies.",
    "customer_loyalty_program_drivers_analysis": "Analyze drivers of customer loyalty program effectiveness and recommend optimization strategies.",
    "market_demand_drivers_analysis": "Identify drivers of market demand and develop demand stimulation strategies.",
    "competitive_threat_drivers_analysis": "Analyze drivers of competitive threats and recommend threat mitigation strategies.",
    "customer_retention_drivers_analysis": "Identify drivers of customer retention and develop retention optimization strategies.",
    "product_profitability_drivers_analysis": "Analyze drivers of product profitability and recommend profitability improvement strategies.",
    "brand_reputation_drivers_analysis": "Identify drivers of brand reputation and develop reputation management strategies.",
    "customer_service_drivers_analysis": "Analyze drivers of customer service quality and recommend service improvement strategies.",
    "market_growth_drivers_analysis": "Identify drivers of market growth and develop growth acceleration strategies.",
    "competitive_response_drivers_analysis": "Analyze drivers of competitive response and recommend response strategies.",
    "customer_feedback_drivers_analysis": "Identify drivers of customer feedback and develop feedback integration strategies.",
    "product_adoption_drivers_analysis": "Analyze drivers of product adoption and recommend adoption acceleration strategies.",
    "brand_advocacy_drivers_analysis": "Identify drivers of brand advocacy and develop advocacy cultivation strategies.",
    "customer_referral_drivers_analysis": "Analyze drivers of customer referrals and recommend referral program optimization strategies.",
    "market_opportunity_drivers_analysis": "Identify drivers of market opportunities and develop opportunity pursuit strategies.",
    "competitive_vulnerability_drivers_analysis": "Analyze drivers of competitive vulnerabilities and recommend vulnerability reduction strategies.",
    "customer_success_drivers_analysis": "Identify drivers of customer success and recommend success optimization strategies.",
    "product_differentiation_drivers_analysis": "Analyze drivers of product differentiation and recommend differentiation strategies.",
    "brand_trust_drivers_analysis": "Identify drivers of brand trust and develop trust-building strategies.",
    "customer_segmentation_drivers_analysis": "Analyze drivers of customer segmentation and recommend segmentation optimization strategies.",
    "market_penetration_drivers_analysis": "Identify drivers of market penetration and develop penetration enhancement strategies.",
    "competitive_intelligence_drivers_analysis": "Analyze drivers of competitive intelligence and recommend intelligence gathering optimization strategies.",
    "customer_onboarding_drivers_analysis": "Identify drivers of customer onboarding success and recommend onboarding process improvement strategies.",
    "product_lifecycle_drivers_analysis": "Analyze drivers of product lifecycle performance and recommend lifecycle management optimization strategies.",
    "brand_positioning_drivers_analysis": "Identify drivers of brand positioning and recommend positioning strategies.",
    "customer_win_back_drivers_analysis": "Analyze drivers of customer win-back success and recommend win-back campaign optimization strategies.",
    "market_sizing_drivers_analysis": "Identify drivers of market sizing accuracy and recommend market sizing methodology improvements.",
    "competitive_benchmarking_drivers_analysis": "Analyze drivers of competitive benchmarking effectiveness and recommend benchmarking process improvement strategies.",
    "customer_experience_measurement_drivers_analysis": "Identify drivers of customer experience measurement effectiveness and recommend measurement optimization strategies.",
      "leadership_style_assessment": "Assess leadership style based on provided text, identifying key characteristics and effectiveness.",
  "team_dynamics_analysis": "Analyze team dynamics, including roles, collaboration levels, and conflict management approaches.",
  "decision_making_process_evaluation": "Evaluate decision-making processes, identifying styles, influencing factors, and effectiveness.",
  "innovation_potential_assessment": "Assess innovation potential, determining level, key drivers, and feasibility of implementation.",
  "change_management_effectiveness": "Evaluate change management effectiveness, assessing readiness, resistance factors, and success likelihood.",
  "diversity_and_inclusion_analysis": "Analyze diversity and inclusion practices, identifying levels, practices, and areas for improvement.",
  "employee_engagement_assessment": "Assess employee engagement levels, identifying key drivers and recommendations for improvement.",
  "customer_segmentation_analysis": "Analyze customer segmentation, identifying segments, characteristics, and targeting strategies.",
  "brand_perception_analysis": "Analyze brand perception, determining associations, scores, and areas for improvement.",
  "competitive_landscape_analysis": "Analyze competitive landscape, identifying key competitors, advantages, and market positioning.",
  "product_usability_evaluation": "Evaluate product usability, determining scores, key issues, and improvement recommendations.",
  "customer_journey_mapping": "Map customer journey, identifying stages, pain points, and opportunities for improvement.",
  "brand_loyalty_assessment": "Assess brand loyalty, determining levels, key drivers, and retention strategies.",
  "market_trend_forecasting": "Forecast market trends, identifying predictions, likelihood, and potential impact.",
  "consumer_behavior_analysis": "Analyze consumer behavior, identifying patterns, influencing factors, and targeting recommendations.",
  "brand_messaging_effectiveness": "Evaluate brand messaging effectiveness, assessing clarity, resonance, and improvement suggestions.",
  "customer_churn_prediction": "Predict customer churn likelihood, identifying key risk factors and retention strategies.",
  "market_segmentation_analysis": "Analyze market segmentation, identifying segments, sizes, and characteristics.",
  "product_feature_analysis": "Analyze product features, determining key features, satisfaction scores, and improvement priorities.",
  "advertising_effectiveness_evaluation": "Evaluate advertising effectiveness, assessing engagement, conversion rates, and ROI.",
  "brand_equity_measurement": "Measure brand equity, determining scores, contributing factors, and improvement strategies.",
  "customer_satisfaction_drivers_analysis": "Analyze customer satisfaction drivers, identifying key drivers, impact, and prioritization.",
  "market_sizing_estimation": "Estimate market size, determining size, growth rate, and key assumptions.",
  "competitor_benchmarking_analysis": "Analyze competitor benchmarking, identifying criteria, scores, and competitive positioning.",
  "customer_persona_development": "Develop customer personas, identifying profiles, characteristics, and targeting strategies.",
  "product_pricing_optimization": "Optimize product pricing, determining optimal range, elasticity, and strategy recommendations.",
  "brand_architecture_assessment": "Assess brand architecture, evaluating hierarchy, relationships, and effectiveness.",
  "customer_lifetime_value_analysis": "Analyze customer lifetime value, determining average value, drivers, and optimization strategies.",
  "market_entry_strategy_evaluation": "Evaluate market entry strategies, assessing attractiveness, barriers, and recommendations.",
  "brand_positioning_assessment": "Assess brand positioning, identifying current and target positioning, and repositioning strategies.",
  "customer_feedback_sentiment_analysis": "Analyze customer feedback sentiment, determining distribution, themes, and actionable insights.",
  "market_demand_forecasting": "Forecast market demand, identifying demand, drivers, and forecast accuracy.",
  "competitive_pricing_analysis": "Analyze competitive pricing, identifying competitor prices, strategy effectiveness, and optimization.",
  "customer_segmentation_targeting_analysis": "Analyze customer segmentation targeting, identifying target segments, criteria, and expected impact.",
  "product_portfolio_optimization": "Optimize product portfolio, determining optimal mix, performance, and optimization strategies.",
  "brand_tracking_analysis": "Analyze brand tracking, identifying health metrics, trends, and strategic recommendations.",
  "customer_experience_journey_analysis": "Analyze customer experience journey, identifying touchpoints, ratings, and improvement priorities.",
  "market_basket_analysis": "Perform market basket analysis, identifying product associations, cross-selling, and revenue impact.",
  "price_sensitivity_analysis": "Analyze price sensitivity, determining sensitivity score, optimal points, and optimization strategies.",
  "brand_extension_evaluation": "Evaluate brand extension, assessing fit, impact, and extension potential.",
  "customer_retention_strategy_analysis": "Analyze customer retention strategies, identifying drivers, churn risk, and program recommendations.",
  "market_penetration_analysis": "Analyze market penetration, determining current rate, growth potential, and penetration strategies.",
  "competitive_advantage_assessment": "Assess competitive advantages, identifying key advantages, sustainability, and leveraging strategies.",
  "customer_profitability_analysis": "Analyze customer profitability, identifying segments, drivers, and optimization opportunities.",
  "product_cannibalization_assessment": "Assess product cannibalization, determining risk, impacted products, and mitigation strategies.",
  "brand_value_proposition_evaluation": "Evaluate brand value proposition, assessing strength, key drivers, and optimization.",
  "customer_acquisition_channel_analysis": "Analyze customer acquisition channels, identifying performance, optimal mix, and budget allocation.",
  "market_share_analysis": "Analyze market share, determining current share, trends, and growth strategies.",
  "competitive_positioning_mapping": "Map competitive positioning, identifying positioning, landscape, and repositioning opportunities.",
  "customer_loyalty_program_effectiveness": "Evaluate customer loyalty program effectiveness, assessing engagement, drivers, and optimization.",
  "product_bundling_analysis": "Analyze product bundling, identifying optimal bundles, impact, and implementation recommendations.",
  "brand_personality_assessment": "Assess brand personality, identifying traits, consistency, and alignment recommendations.",
  "customer_service_quality_evaluation": "Evaluate customer service quality, assessing scores, key attributes, and improvement areas.",
  "market_opportunity_assessment": "Assess market opportunities, determining attractiveness, success factors, and pursuit strategies.",
  "competitive_threat_assessment": "Assess competitive threats, identifying key threats, impact, and mitigation strategies.",
  "customer_needs_analysis": "Analyze customer needs, identifying key needs, importance, and unmet needs.",
  "product_innovation_opportunities": "Identify product innovation opportunities, assessing areas, market potential, and feasibility.",
  "brand_awareness_measurement": "Measure brand awareness, determining levels, channels, and recall scores.",
  "customer_segmentation_effectiveness": "Evaluate customer segmentation effectiveness, assessing distinctiveness, actionability, and optimization.",
  "product_cannibalization_risk_assessment": "Assess product cannibalization risk, determining risk score, at-risk products, and mitigation.",
  "brand_loyalty_drivers_analysis": "Analyze brand loyalty drivers, identifying key drivers, impact, and enhancement strategies.",
  "customer_lifetime_value_prediction": "Predict customer lifetime value, estimating value, drivers, and maximization strategies.",
  "market_basket_analysis_product_affinity": "Analyze market basket product affinity, identifying affinities, cross-selling, and bundle recommendations.",
  "price_elasticity_measurement": "Measure price elasticity, determining elasticity score, optimal range, and revenue impact.",
  "brand_personality_perception_analysis": "Analyze brand personality perception, identifying perceived traits, alignment, and refinement.",
  "customer_churn_risk_prediction": "Predict customer churn risk, determining risk score, drivers, and retention strategies.",
  "market_size_estimation": "Estimate market size, determining size, growth rate, and share potential.",
  "competitive_intensity_assessment": "Assess competitive intensity, determining intensity score, key competitors, and differentiation.",
  "customer_satisfaction_measurement": "Measure customer satisfaction, determining satisfaction score, drivers, and improvement priorities.",
  "product_feature_preference_analysis": "Analyze product feature preferences, identifying preferred features, importance, and optimization.",
  "brand_perception_gap_analysis": "Analyze brand perception gaps, identifying perceived attributes, desired attributes, and gap assessment.",
  "customer_complaint_root_cause_analysis": "Analyze customer complaint root causes, identifying causes, frequency, and resolution effectiveness.",
  "market_trend_impact_assessment": "Assess market trend impact, identifying relevant trends, impact scores, and leverage strategies.",
  "competitive_price_benchmarking": "Benchmark competitive prices, identifying competitor prices, competitiveness, and adjustment recommendations.",
  "customer_service_performance_evaluation": "Evaluate customer service performance, assessing metrics, quality scores, and improvement areas.",
  "product_usage_pattern_analysis": "Analyze product usage patterns, identifying patterns, intensity, and optimization insights.",
  "brand_advocacy_measurement": "Measure brand advocacy, determining advocacy score, drivers, and cultivation strategies.",
  "customer_journey_mapping_analysis": "Analyze customer journey mapping, identifying stages, satisfaction scores, and optimization.",
  "market_whitespace_identification": "Identify market whitespace, assessing opportunities, attractiveness, and entry strategies.",
  "competitive_strength_assessment": "Assess competitive strengths, identifying strengths, relative scores, and leveraging strategies.",
  "customer_referral_behavior_analysis": "Analyze customer referral behavior, determining likelihood, drivers, and program optimization.",
  "product_profitability_analysis": "Analyze product profitability, identifying metrics, improvement areas, and optimization recommendations.",
  "brand_elements_effectiveness_evaluation": "Evaluate brand elements effectiveness, assessing elements, scores, and refinement strategies.",
  "customer_onboarding_process_evaluation": "Evaluate customer onboarding process, identifying steps, completion rates, and optimization.",
  "market_growth_driver_analysis": "Analyze market growth drivers, identifying drivers, impact scores, and acceleration strategies.",
  "competitive_vulnerability_assessment": "Assess competitive vulnerabilities, identifying vulnerabilities, impact, and mitigation strategies.",
  "customer_touchpoint_effectiveness_analysis": "Analyze customer touchpoint effectiveness, identifying touchpoints, scores, and optimization.",
  "product_return_reason_analysis": "Analyze product return reasons, identifying reasons, frequency, and reduction strategies.",
  "brand_crisis_management_effectiveness": "Evaluate brand crisis management effectiveness, assessing response, impact, and recovery strategies.",
  "customer_retention_program_performance": "Evaluate customer retention program performance, assessing metrics, effectiveness, and optimization.",
  "market_entry_barrier_analysis": "Analyze market entry barriers, identifying barriers, impact, and mitigation strategies.",
  "competitive_response_scenario_planning": "Plan competitive response scenarios, identifying scenarios, likelihood, and response strategies.",
  "customer_win_back_strategy_effectiveness": "Evaluate customer win-back strategy effectiveness, assessing success rate, drivers, and refinement.",
  "product_line_extension_evaluation": "Evaluate product line extension, identifying opportunities, feasibility, and prioritization.",
  "brand_partnership_opportunity_assessment": "Assess brand partnership opportunities, identifying potential partners, fit, and strategies.",
  "customer_experience_friction_point_analysis": "Analyze customer experience friction points, identifying points, severity, and reduction strategies.",
  "product_demand_forecasting_accuracy": "Evaluate product demand forecasting accuracy, assessing accuracy score, drivers, and improvement.",
  "brand_reputation_monitoring_effectiveness": "Evaluate brand reputation monitoring effectiveness, assessing sentiment, influencers, and best practices.",
  "customer_service_channel_preference_analysis": "Analyze customer service channel preferences, identifying preferred channels, scores, and optimization.",
  "market_segmentation_stability_assessment": "Assess market segmentation stability, determining stability score, trends, and refresh recommendations.",
  "competitive_market_share_change_analysis": "Analyze competitive market share changes, identifying change percentages, drivers, and defense strategies.",
  "customer_loyalty_program_roi_measurement": "Measure customer loyalty program ROI, determining ROI, improvement areas, and optimization strategies.",
  "product_pricing_strategy_simulation": "Simulate product pricing strategies, identifying scenarios, impact projections, and recommendations.",
  "brand_portfolio_optimization_analysis": "Analyze brand portfolio optimization, identifying opportunities, synergy scores, and rationalization.",
  "customer_behavior_trend_forecasting": "Forecast customer behavior trends, identifying trend predictions, impact scores, and response strategies.",
  "product_attribute_importance_evaluation": "Evaluate product attribute importance, identifying key attributes, importance scores, and optimization.",
  "process_efficiency_analysis": "Analyze process efficiency, identifying bottlenecks, waste, and improvement opportunities."
}

JSON_SCHEMAS = {
        "sentiment_analysis": {
        "sentiment": "string (positive, negative, neutral)",
        "confidence_score": "number (0-1)",
        "text_snippets": "array of strings (specific text portions contributing to sentiment)"
      },
      "text_summarization": {
        "summary": "string",
        "key_points": "array of strings (main points summarized)",
        "length": "number (number of words in summary)"
      },
      "topic_extraction": {
        "topics": "array of strings",
        "relevance_scores": "array of numbers (0-1) (relevance of each topic)",
        "key_phrases": "array of strings (phrases most associated with each topic)"
      },
      "emotion_detection": {
        "emotion": "string (primary emotion detected)",
        "confidence_score": "number (0-1)",
        "secondary_emotions": "array of objects (secondary emotions and their scores)"
      },
      "language_translation": {
        "translated_text": "string",
        "source_language": "string (detected or specified source language)",
        "target_language": "string (language into which text is translated)"
      },
      "grammatical_error_check": {
        "corrected_text": "string",
        "errors": "array of objects (error details including type, position, and suggestions)",
        "total_errors": "number (total count of errors found)"
      },
      "keyword_extraction": {
        "keywords": "array of strings (key phrases or words extracted from the text)",
        "relevance_scores": "array of numbers (0-1) (indicating the relevance of each keyword)",
        "context_snippets": "array of strings (text snippets where each keyword prominently features)",
        "keyword_frequency": "array of numbers (count of occurrences of each keyword in the text)"
      },
      "content_classification": {
        "category": "string",
        "subcategories": "array of strings",
        "confidence_score": "number (0-1)",
        "contextual_details": "array of strings (explanations for classification)"
      },
      "trend_analysis": {
        "trends": "array of objects (each object detailing trend name, relevance score, and description)",
        "emerging_trends": "array of strings (newly identified trends)",
        "trend_lifetime": "array of objects (duration and evolution of each trend)"
      },
      "customer_feedback_analysis": {
        "feedback_summary": "string",
        "sentiment": "string (positive, negative, neutral)",
        "key_feedback_points": "array of strings",
        "customer_satisfaction_index": "number (0-1)"
      },
      "brand_sentiment_analysis": {
        "brand_sentiment": "string (positive, negative, neutral)",
        "confidence_score": "number (0-1)",
        "key_sentiment_drivers": "array of strings",
        "brand_health_index": "number (overall health score of the brand)"
      },
      "product_review_analysis": {
        "review_summary": "string",
        "sentiment": "string (positive, negative, neutral)",
        "product_rating": "number (average rating from reviews)",
        "key_review_topics": "array of strings (main topics mentioned in reviews)"
      },
      "market_research_analysis": {
        "market_trends": "array of objects (trend details including trend name, impact score, and description)",
        "consumer_preferences": "array of objects (preference details including preference type and popularity score)",
        "market_segmentation": "array of objects (segmentation details including segment name and characteristics)"
      },
      "political_bias_detection": {
        "bias": "string (left, right, neutral)",
        "confidence_score": "number (0-1)",
        "bias_indicators": "array of strings (elements indicating bias)",
        "political_alignment_score": "number (quantifying degree of political bias)"
      },
      "fake_news_detection": {
        "credibility": "string (credible, not credible)",
        "confidence_score": "number (0-1)",
        "fact_check_results": "array of objects (details of fact-checking each claim)",
        "reliability_index": "number (overall reliability score)"
      },
      "cultural_trend_analysis": {
        "trends": "array of objects (trend details including trend name, cultural impact score, and description)",
        "cultural_shifts": "array of objects (shift details including shift name, affected areas, and significance)",
        "cultural_health_index": "number (overall health score of cultural aspects)"
      },
      "historical_data_analysis": {
        "key_events": "array of objects (event details including event name, date, and significance)",
        "patterns": "array of objects (pattern details including pattern name, frequency, and implications)",
        "historical_impact_score": "number (quantifying impact of historical events)"
      },
      "literary_analysis": {
        "themes": "array of strings",
        "character_development": "string",
        "narrative_style": "string"
      },
      "scientific_research_analysis": {
        "research_findings": "string",
        "methodology": "string",
        "conclusions": "string"
      },
      "social_media_monitoring": {
        "trending_topics": "array of strings",
        "influential_posts": "array of objects (post details)",
        "sentiment": "string (positive, negative, neutral)",
        "confidence_score": "number (0-1)",
        "likes": "number",
        "shares": "number",
        "comments": "number",
        "retweets": "number",
        "age_range": "string",
        "location": "string",
        "gender": "string",
        "influencers": "array of strings",
        "influence_score": "number (0-1)",
        "category": "string",
        "subcategories": "array of strings",
        "future_trends": "array of strings",
        "prediction_confidence": "number (0-1)",
        "timeline": "array of objects date and relevance score",
        "hashtags": "array of strings",
        "usage_frequency": "number",
        "source": "string",
        "credibility_score": "number (0-1)",
        "emotions": "array of objects (emotion type and score)"
      },
      "psychological_analysis": {
        "emotional_states": "array of strings",
        "behavioral_patterns": "string"
      },
      "criminal_intent_detection": {
        "potential_risks": "array of strings",
        "threat_level": "string"
      },
      "behavioral_analysis": {
        "observed_behaviors": "array of strings",
        "behavioral_patterns": "string",
        "motivations": "string"
      },
      "relationship_analysis": {
        "interaction_types": "array of strings",
        "relationship_dynamics": "string",
        "communication_patterns": "string"
      },
      "emotional_intelligence_analysis": {
        "empathy_levels": "string",
        "self_awareness_assessment": "string",
        "social_skills_evaluation": "string"
      },
      "ideological_alignment_detection": {
        "political_ideologies": "array of strings",
        "alignment_strength": "number (0-1)"
      },
      "conflict_resolution_analysis": {
        "conflict_types": "array of strings",
        "resolution_strategies": "array of strings"
      },
      "narrative_analysis": {
        "plot_structure": "string",
        "character_roles": "array of objects (character details)",
        "thematic_elements": "array of strings"
      },
      "ethical_stance_detection": {
        "ethical_positions": "array of strings",
        "stance_strength": "number (0-1)"
      },
      "propaganda_identification": {
        "propaganda_techniques": "array of strings",
        "persuasive_strength": "number (0-1)"
      },
      "socioeconomic_status_analysis": {
        "economic_indicators": "array of strings",
        "social_factors": "array of strings"
      },
      "health_and_wellness_analysis": {
        "health_conditions_identified": "array of strings",
        "wellness_recommendations": "array of strings"
      },
      "sarcasm_and_irony_detection": {
        "sarcasm_level": "string",
        "irony_type": "string"
      },
      "crisis_detection_analysis": {
        "crisis_signals": "array of strings",
        "urgency_level": "string"
      },
      "cognitive_bias_identification": {
        "biases_identified": "array of strings",
        "bias_impact": "string"
      },
      "dialogue_analysis": {
        "speaking_styles": "array of strings",
        "conversation_themes": "array of strings"
      },
      "legal_document_analysis": {
        "key_clauses": "array of strings",
        "document_legality": "string"
      },
      "cultural_analysis": {
        "cultural_values": "array of strings",
        "societal_norms": "array of strings"
      },
      "user_experience_feedback_analysis": {
        "usability_issues": "array of strings",
        "user_satisfaction_levels": "string"
      },
      "automated_therapy_session_analysis": {
        "therapeutic_techniques_used": "array of strings",
        "patient_response_types": "array of strings"
      },
      "stress_level_detection": {
        "stress_level": "string",
        "stress_triggers": "array of strings"
      },
      "mood_detection": {
        "mood": "string",
        "mood_intensity": "number"
      },
      "personality_type_analysis": {
        "personality_type": "string",
        "trait_scores": "object"
      },
      "cognitive_load_measurement": {
        "cognitive_load_level": "string",
        "factors_contributing": "array of strings"
      },
      "therapeutic_intervention_analysis": {
        "interventions": "array of strings",
        "effectiveness": "number"
      },
      "empathy_level_assessment": {
        "empathy_level": "string",
        "empathetic_responses": "array of strings"
      },
      "conflict_tendency_analysis": {
        "conflict_triggers": "array of strings",
        "conflict_resolution": "string"
      },
      "motivational_analysis": {
        "motivational_messages": "array of strings",
        "impact_score": "number"
      },
      "mindfulness_meditation_effectiveness": {
        "techniques_used": "array of strings",
        "effectiveness_score": "number"
      },
      "psychological_resilience_assessment": {
        "resilience_level": "string",
        "coping_strategies": "array of strings"
      },
      "addiction_tendency_analysis": {
        "addictive_behaviors": "array of strings",
        "severity_level": "string"
      },
      "depression_anxiety_detection": {
        "depression_level": "string",
        "anxiety_level": "string"
      },
      "self_esteem_assessment": {
        "self_esteem_level": "string",
        "influencing_factors": "array of strings"
      },
      "trauma_analysis": {
        "traumatic_events": "array of strings",
        "psychological_impact": "string"
      },
      "life_satisfaction_analysis": {
        "satisfaction_level": "string",
        "key_factors": "array of strings"
      },
      "sleep_quality_assessment": {
        "sleep_quality": "string",
        "disruptive_factors": "array of strings"
      },
      "psychosomatic_symptom_analysis": {
        "symptoms": "array of strings",
        "psychological_causes": "array of strings"
      },
      "learning_style_identification": {
        "preferred_styles": "array of strings",
        "effectiveness": "number"
      },

      "interpersonal_relationship_analysis": {
         "relationship_types": "array of strings", 
         "interaction_patterns": "array of strings"
     },
     "cultural_adaptation_analysis": {
         "adaptation_levels": "array of strings", 
         "challenges_faced": "array of strings"
     },
        
     # ... (rest of the JSON schemas)
       
     "leadership_style_assessment": {
         "leadership_style": "string",
         "key_characteristics": "array of strings",
         "effectiveness_score": "number (0-1)"
     },
     "team_dynamics_analysis": {
         "team_roles": "array of strings",
         "collaboration_level": "string",
         "conflict_management": "string"
     },
     "decision_making_process_evaluation": {
         "decision_making_style": "string",
         "influencing_factors": "array of strings",
         "effectiveness_score": "number (0-1)"
     },
     "innovation_potential_assessment": {
         "innovation_level": "string",
         "key_drivers": "array of strings",
         "implementation_feasibility": "string"
     },
     "change_management_effectiveness": {
         "change_readiness": "string",
         "resistance_factors": "array of strings",
         "implementation_success_score": "number (0-1)"
     },
     "diversity_and_inclusion_analysis": {
         "diversity_level": "string",
         "inclusion_practices": "array of strings",
         "improvement_areas": "array of strings"
     },
     "employee_engagement_assessment": {
         "engagement_level": "string",
         "key_drivers": "array of strings",
         "improvement_recommendations": "array of strings"
     },
     "customer_segmentation_analysis": {
         "customer_segments": "array of objects",
         "segment_characteristics": "array of strings",
         "targeting_strategies": "array of strings"
     },
     "brand_perception_analysis": {
         "brand_associations": "array of strings",
         "perception_score": "number (0-1)",
         "improvement_areas": "array of strings"
     },
     "competitive_landscape_analysis": {
         "key_competitors": "array of strings",
         "competitive_advantages": "array of strings",
         "market_positioning": "string"
     },
     "product_usability_evaluation": {
         "usability_score": "number (0-1)",
         "key_issues": "array of strings",
         "improvement_recommendations": "array of strings"
     },
     "customer_journey_mapping": {
         "journey_stages": "array of strings",
         "pain_points": "array of strings",
         "improvement_opportunities": "array of strings"
     },
     "brand_loyalty_assessment": {
         "loyalty_level": "string",
         "key_drivers": "array of strings",
         "retention_strategies": "array of strings"
     },
     "market_trend_forecasting": {
         "trend_predictions": "array of strings",
         "likelihood_scores": "array of numbers (0-1)",
         "impact_assessment": "string"
     },
     "consumer_behavior_analysis": {
         "behavior_patterns": "array of strings",
         "influencing_factors": "array of strings",
         "targeting_recommendations": "array of strings"
     },
     "brand_messaging_effectiveness": {
         "message_clarity_score": "number (0-1)",
         "resonance_level": "string",
         "improvement_suggestions": "array of strings"
     },
     "customer_churn_prediction": {
         "churn_likelihood": "number (0-1)",
         "key_risk_factors": "array of strings",
         "retention_strategies": "array of strings"
     },
     "market_segmentation_analysis": {
         "market_segments": "array of objects",
         "segment_size": "array of numbers",
         "segment_characteristics": "array of strings"
     },
     "product_feature_analysis": {
         "key_features": "array of strings",
         "user_satisfaction_scores": "array of numbers (0-1)",
         "improvement_priorities": "array of strings"
     },
     "advertising_effectiveness_evaluation": {
         "engagement_rate": "number (0-1)",
         "conversion_rate": "number (0-1)",
         "roi_assessment": "string"
     },
     "brand_equity_measurement": {
         "brand_equity_score": "number (0-1)",
         "key_contributing_factors": "array of strings",
         "improvement_strategies": "array of strings"
     },
     "customer_satisfaction_drivers_analysis": {
         "satisfaction_drivers": "array of strings",
         "impact_scores": "array of numbers (0-1)",
         "prioritization_matrix": "object"
     },
     "market_sizing_estimation": {
         "market_size_estimate": "number",
         "growth_rate": "number (0-1)",
         "key_assumptions": "array of strings"
     },
     "competitor_benchmarking_analysis": {
         "benchmarking_criteria": "array of strings",
         "competitor_scores": "array of objects",
         "competitive_positioning": "string"
     },
     "customer_persona_development": {
         "persona_profiles": "array of objects",
         "key_characteristics": "array of strings",
         "targeting_strategies": "array of strings"
     },
     "product_pricing_optimization": {
         "optimal_price_range": "string",
         "price_elasticity": "number",
         "pricing_strategy_recommendations": "array of strings"
     },
     "brand_architecture_assessment": {
         "brand_hierarchy": "object",
         "brand_relationships": "array of strings",
         "architecture_effectiveness_score": "number (0-1)"
     },
     "customer_lifetime_value_analysis": {
         "average_customer_lifetime_value": "number",
         "key_drivers": "array of strings",
         "optimization_strategies": "array of strings"
     },
     "market_entry_strategy_evaluation": {
         "market_attractiveness_score": "number (0-1)",
         "entry_barriers": "array of strings",
         "recommended_entry_strategies": "array of strings"
     },
     "brand_positioning_assessment": {
         "current_positioning": "string",
         "target_positioning": "string",
         "repositioning_strategies": "array of strings"
     },
     "customer_feedback_sentiment_analysis": {
         "sentiment_distribution": "object",
         "key_themes": "array of strings",
         "actionable_insights": "array of strings"
     },
     "market_demand_forecasting": {
         "demand_forecast": "object",
         "key_drivers": "array of strings",
         "forecast_accuracy_score": "number (0-1)"
     },
     "competitive_pricing_analysis": {
         "competitor_pricing": "array of objects",
         "pricing_strategy_effectiveness": "string",
         "optimization_recommendations": "array of strings"
     },
     "customer_segmentation_targeting_analysis": {
         "target_segments": "array of objects",
         "targeting_criteria": "array of strings",
         "expected_impact": "string"
     },
     "product_portfolio_optimization": {
         "optimal_product_mix": "array of strings",
         "portfolio_performance_score": "number (0-1)",
         "optimization_strategies": "array of strings"
     },
     "brand_tracking_analysis": {
         "brand_health_metrics": "object",
         "trend_analysis": "string",
         "strategic_recommendations": "array of strings"
     },
     "customer_experience_journey_analysis": {
         "experience_touchpoints": "array of strings",
         "experience_ratings": "array of numbers (0-1)",
         "improvement_priorities": "array of strings"
     },
     "market_basket_analysis": {
         "product_associations": "array of objects",
         "cross_selling_opportunities": "array of strings",
         "revenue_impact_estimate": "number"
     },
     "price_sensitivity_analysis": {
         "price_sensitivity_score": "number (0-1)",
         "optimal_price_points": "array of numbers",
         "revenue_optimization_strategies": "array of strings"
     },
     "brand_extension_evaluation": {
         "extension_fit_score": "number (0-1)",
         "brand_impact_assessment": "string",
         "extension_potential": "string"
     },
     "customer_retention_strategy_analysis": {
         "retention_drivers": "array of strings",
         "churn_risk_assessment": "string",
         "retention_program_recommendations": "array of strings"
     },
     "market_penetration_analysis": {
         "current_penetration_rate": "number (0-1)",
         "growth_potential_score": "number (0-1)",
         "penetration_strategies": "array of strings"
     },
     "competitive_advantage_assessment": {
         "key_competitive_advantages": "array of strings",
         "sustainability_score": "number (0-1)",
         "leveraging_strategies": "array of strings"
     },
     "customer_profitability_analysis": {
         "customer_profitability_segments": "array of objects",
         "profitability_drivers": "array of strings",
         "optimization_opportunities": "array of strings"
     },
     "product_cannibalization_assessment": {
         "cannibalization_risk_score": "number (0-1)",
         "impacted_products": "array of strings",
         "mitigation_strategies": "array of strings"
     },
     "brand_value_proposition_evaluation": {
         "value_proposition_strength_score": "number (0-1)",
         "key_value_drivers": "array of strings",
         "optimization_recommendations": "array of strings"
     },
     "customer_acquisition_channel_analysis": {
         "acquisition_channel_performance": "array of objects",
         "optimal_channel_mix": "object",
         "budget_allocation_recommendations": "object"
     },
     "market_share_analysis": {
         "current_market_share": "number (0-1)",
         "market_share_trend": "string",
         "share_gain_strategies": "array of strings"
     },
     "competitive_positioning_mapping": {
         "positioning_map": "object",
         "competitive_landscape_assessment": "string",
         "repositioning_opportunities": "array of strings"
     },
     "customer_loyalty_program_effectiveness": {
         "program_engagement_score": "number (0-1)",
         "loyalty_drivers": "array of strings",
         "program_optimization_strategies": "array of strings"
     },
     "product_bundling_analysis": {
         "optimal_product_bundles": "array of objects",
         "bundling_impact_assessment": "string",
         "implementation_recommendations": "array of strings"
     },
     "brand_personality_assessment": {
         "brand_personality_traits": "array of strings",
         "brand_personality_consistency_score": "number (0-1)",
         "alignment_recommendations": "array of strings"
     },
     "customer_service_quality_evaluation": {
         "service_quality_score": "number (0-1)",
         "key_service_attributes": "array of strings",
         "improvement_areas": "array of strings"
     },
     "market_opportunity_assessment": {
         "opportunity_attractiveness_score": "number (0-1)",
         "key_success_factors": "array of strings",
         "recommended_pursuit_strategies": "array of strings"
     },
     "competitive_threat_assessment": {
         "key_competitive_threats": "array of strings",
         "threat_impact_scores": "array of numbers (0-1)",
         "mitigation_strategies": "array of strings"
     },    
     "customer_needs_analysis": {
         "key_customer_needs": "array of strings",
         "need_importance_scores": "array of numbers (0-1)",
         "unmet_needs": "array of strings"
     },
     "product_innovation_opportunities": {
         "innovation_areas": "array of strings",
         "market_potential_score": "number (0-1)",
         "feasibility_assessment": "string"
     },
     "brand_awareness_measurement": {
         "awareness_level": "string",
         "awareness_channels": "array of strings",
         "brand_recall_score": "number (0-1)"
     },
     "customer_segmentation_effectiveness": {
         "segment_distinctiveness_score": "number (0-1)",
         "segment_actionability_assessment": "string",
         "optimization_recommendations": "array of strings"
     },
     "product_cannibalization_risk_assessment": {
         "cannibalization_risk_score": "number (0-1)",
         "at_risk_products": "array of strings",
         "mitigation_strategies": "array of strings"
     },
     "brand_loyalty_drivers_analysis": {
         "loyalty_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "loyalty_enhancement_strategies": "array of strings"
     },
     "customer_lifetime_value_prediction": {
         "predicted_lifetime_value": "number",
         "key_value_drivers": "array of strings",
         "value_maximization_strategies": "array of strings"
     },
     "market_basket_analysis_product_affinity": {
         "product_affinities": "array of objects",
         "cross_selling_potential": "string",
         "bundle_recommendations": "array of strings"
     },
     "price_elasticity_measurement": {
         "price_elasticity_score": "number",
         "optimal_price_range": "string",
         "revenue_impact_projection": "string"
     },
     "brand_personality_perception_analysis": {
         "perceived_personality_traits": "array of strings",
         "brand_personality_alignment_score": "number (0-1)",
         "personality_refinement_strategies": "array of strings" 
     },
     "customer_churn_risk_prediction": {
         "churn_risk_score": "number (0-1)",
         "key_churn_drivers": "array of strings",
         "retention_strategy_recommendations": "array of strings"
     },
     "market_size_estimation": {
         "estimated_market_size": "number",
         "market_growth_rate": "number (0-1)",
         "market_share_potential": "number (0-1)"
     },
     "competitive_intensity_assessment": {
         "competitive_intensity_score": "number (0-1)",
         "key_competitors": "array of strings",
         "competitive_differentiation_strategies": "array of strings"
     },
     "customer_satisfaction_measurement": {
         "satisfaction_score": "number (0-1)",
         "key_satisfaction_drivers": "array of strings",
         "improvement_priorities": "array of strings"
     },
     "product_feature_preference_analysis": {
         "preferred_features": "array of strings",
         "feature_importance_scores": "array of numbers (0-1)",
         "feature_optimization_recommendations": "array of strings"
     },
     "brand_perception_gap_analysis": {
         "perceived_brand_attributes": "array of strings",
         "desired_brand_attributes": "array of strings",
         "perception_gap_assessment": "string"
     },
     "customer_complaint_root_cause_analysis": {
         "root_causes": "array of strings",
         "occurrence_frequency": "array of numbers",
         "resolution_effectiveness_score": "number (0-1)"
     },
     "market_trend_impact_assessment": {
         "relevant_trends": "array of strings",
         "trend_impact_scores": "array of numbers (0-1)",
         "trend_leverage_strategies": "array of strings"
     },
     "competitive_price_benchmarking": {
         "competitor_prices": "array of objects",
         "price_competitiveness_score": "number (0-1)",
         "price_adjustment_recommendations": "array of strings"
     },
     "customer_service_performance_evaluation": {
         "service_performance_metrics": "object",
         "service_quality_score": "number (0-1)",
         "service_improvement_areas": "array of strings"
     },
     "product_usage_pattern_analysis": {
         "usage_patterns": "array of strings",
         "usage_intensity_score": "number (0-1)",
         "product_optimization_insights": "array of strings"
     },
     "brand_advocacy_measurement": {
         "brand_advocacy_score": "number (0-1)",
         "key_advocacy_drivers": "array of strings",
         "advocacy_cultivation_strategies": "array of strings"
     },
     "customer_journey_mapping_analysis": {
         "journey_stages": "array of strings",
         "stage_satisfaction_scores": "array of numbers (0-1)",
         "journey_optimization_recommendations": "array of strings"
     },
     "market_whitespace_identification": {
         "whitespace_opportunities": "array of strings",
         "opportunity_attractiveness_scores": "array of numbers (0-1)",
         "market_entry_strategies": "array of strings"
     },
     "competitive_strength_assessment": {
         "competitive_strengths": "array of strings",
         "relative_strength_scores": "array of numbers (0-1)",
         "strength_leveraging_strategies": "array of strings"
     },
     "customer_referral_behavior_analysis": {
         "referral_likelihood_score": "number (0-1)",
         "key_referral_drivers": "array of strings",
         "referral_program_optimization_strategies": "array of strings"
     },
     "product_profitability_analysis": {
         "product_profitability_metrics": "object",
         "profitability_improvement_areas": "array of strings",
         "profit_optimization_recommendations": "array of strings"
     },
     "brand_elements_effectiveness_evaluation": {
         "brand_elements": "array of strings",
         "effectiveness_scores": "array of numbers (0-1)",
         "brand_element_refinement_strategies": "array of strings"
     },
     "customer_onboarding_process_evaluation": {
         "onboarding_process_steps": "array of strings",
         "step_completion_rates": "array of numbers (0-1)",
         "onboarding_optimization_recommendations": "array of strings"
     },
     "market_growth_driver_analysis": {
         "growth_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "growth_acceleration_strategies": "array of strings"
     },
     "competitive_vulnerability_assessment": {
         "competitive_vulnerabilities": "array of strings",
         "vulnerability_impact_scores": "array of numbers (0-1)",
         "vulnerability_mitigation_strategies": "array of strings"
     },
     "customer_touchpoint_effectiveness_analysis": {
         "customer_touchpoints": "array of strings",
         "touchpoint_effectiveness_scores": "array of numbers (0-1)",
         "touchpoint_optimization_recommendations": "array of strings"
     },
     "product_return_reason_analysis": {
         "return_reasons": "array of strings",
         "reason_frequency_scores": "array of numbers (0-1)",
         "return_reduction_strategies": "array of strings"
     },
     "brand_crisis_management_effectiveness": {
         "crisis_response_effectiveness_score": "number (0-1)",
         "crisis_impact_assessment": "string",
         "crisis_recovery_strategies": "array of strings"
     },
     "customer_retention_program_performance": {
         "retention_program_metrics": "object",
         "program_effectiveness_score": "number (0-1)",
         "program_optimization_recommendations": "array of strings"
     },
     "market_entry_barrier_analysis": {
         "entry_barriers": "array of strings",
         "barrier_impact_scores": "array of numbers (0-1)",
         "barrier_mitigation_strategies": "array of strings"
     },
     "competitive_response_scenario_planning": {
         "competitive_scenarios": "array of objects",
         "scenario_likelihood_scores": "array of numbers (0-1)",
         "scenario_response_strategies": "array of objects"
     },
     "customer_win_back_strategy_effectiveness": {
         "win_back_success_rate": "number (0-1)",
         "key_win_back_drivers": "array of strings",
         "win_back_strategy_refinement_recommendations": "array of strings"
     },
     "product_line_extension_evaluation": {
         "extension_opportunities": "array of strings",
         "extension_feasibility_scores": "array of numbers (0-1)",
         "extension_prioritization_recommendations": "array of strings"
     },
     "brand_partnership_opportunity_assessment": {
         "potential_partners": "array of strings",
         "partnership_fit_scores": "array of numbers (0-1)",
         "partnership_strategy_recommendations": "array of strings"
     },
     "customer_experience_friction_point_analysis": {
         "friction_points": "array of strings",
         "friction_severity_scores": "array of numbers (0-1)",
         "friction_reduction_strategies": "array of strings"
     },
     "product_demand_forecasting_accuracy": {
         "forecasting_accuracy_score": "number (0-1)",
         "key_accuracy_drivers": "array of strings",
         "forecasting_process_improvement_recommendations": "array of strings"
     },
     "brand_reputation_monitoring_effectiveness": {
         "reputation_sentiment_score": "number (0-1)",
         "key_reputation_influencers": "array of strings",
         "reputation_management_best_practices": "array of strings"
     },
     "customer_service_channel_preference_analysis": {
         "preferred_service_channels": "array of strings",
         "channel_preference_scores": "array of numbers (0-1)",
         "channel_optimization_strategies": "array of strings"
     },
     "market_segmentation_stability_assessment": {
         "segment_stability_score": "number (0-1)",
         "segment_evolution_trends": "array of strings",
         "segmentation_refresh_recommendations": "array of strings"
     },
     "competitive_market_share_change_analysis": {
         "market_share_change_percentages": "object",
         "key_change_drivers": "array of strings",
         "share_defense_strategies": "array of strings"
     },
     "customer_loyalty_program_roi_measurement": {
         "loyalty_program_roi": "number",
         "roi_improvement_areas": "array of strings",
         "roi_optimization_strategies": "array of strings"
     },
     "product_pricing_strategy_simulation": {
         "pricing_scenarios": "array of objects",
         "scenario_impact_projections": "array of objects",
         "recommended_pricing_strategy": "string"
     },
     "brand_portfolio_optimization_analysis": {
         "portfolio_optimization_opportunities": "array of strings",
         "brand_synergy_scores": "array of numbers (0-1)",
         "portfolio_rationalization_recommendations": "array of strings"
     },
     "customer_behavior_trend_forecasting": {
         "behavior_trend_predictions": "array of strings",
         "trend_impact_scores": "array of numbers (0-1)",
         "proactive_response_strategies": "array of strings"
     },
      "product_attribute_importance_evaluation": {
         "key_product_attributes": "array of strings",
         "attribute_importance_scores": "array of numbers (0-1)",
         "attribute_optimization_recommendations": "array of strings"
     },
     "brand_perception_drivers_analysis": {
         "perception_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "brand_alignment_recommendations": "array of strings"
     },
     "customer_acquisition_channel_effectiveness": {
         "acquisition_channels": "array of strings",
         "channel_effectiveness_scores": "array of numbers (0-1)",
         "channel_optimization_strategies": "array of strings"
     },
     "market_share_drivers_analysis": {
         "market_share_drivers": "array of strings",
         "driver_importance_scores": "array of numbers (0-1)",
         "share_growth_strategies": "array of strings"
     },
     "competitive_advantage_sustainability_assessment": {
         "competitive_advantages": "array of strings",
         "sustainability_scores": "array of numbers (0-1)",
         "advantage_enhancement_strategies": "array of strings"
     },
     "customer_lifetime_value_drivers_analysis": {
         "lifetime_value_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "value_maximization_strategies": "array of strings"
     },
     "product_innovation_success_factors_analysis": {
         "success_factors": "array of strings",
         "factor_importance_scores": "array of numbers (0-1)",
         "innovation_process_optimization_recommendations": "array of strings"
     },
     "brand_loyalty_drivers_analysis": {
         "loyalty_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "loyalty_enhancement_strategies": "array of strings"
     },
     "customer_churn_drivers_analysis": {
         "churn_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "churn_reduction_strategies": "array of strings"
     },
     "market_trend_drivers_analysis": {
         "trend_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "trend_leveraging_strategies": "array of strings"
     },
     "competitive_pricing_drivers_analysis": {
         "pricing_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "pricing_optimization_recommendations": "array of strings"
     },
     "customer_satisfaction_drivers_analysis": {
         "satisfaction_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "satisfaction_improvement_strategies": "array of strings"
     },
     "product_usability_drivers_analysis": {
         "usability_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "usability_enhancement_recommendations": "array of strings"
     },
     "brand_awareness_drivers_analysis": {
         "awareness_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "awareness_building_strategies": "array of strings"
     },
     "customer_engagement_drivers_analysis": {
         "engagement_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "engagement_optimization_strategies": "array of strings"
     },
     "market_entry_success_factors_analysis": {
         "success_factors": "array of strings",
         "factor_importance_scores": "array of numbers (0-1)",
         "market_entry_strategy_recommendations": "array of strings"
     },
     "competitive_differentiation_drivers_analysis": {
         "differentiation_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "differentiation_enhancement_strategies": "array of strings"
     },
     "customer_experience_drivers_analysis": {
         "experience_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "experience_improvement_recommendations": "array of strings"
     },
     "product_quality_drivers_analysis": {
         "quality_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "quality_assurance_optimization_strategies": "array of strings"
     },
     "brand_equity_drivers_analysis": {
         "equity_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "equity_building_strategies": "array of strings"
     },
     "customer_loyalty_program_drivers_analysis": {
         "loyalty_program_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "loyalty_program_optimization_recommendations": "array of strings"
     },
     "market_demand_drivers_analysis": {
         "demand_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "demand_stimulation_strategies": "array of strings"
     },
     "competitive_threat_drivers_analysis": {
         "threat_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "threat_mitigation_strategies": "array of strings"
     },
     "customer_retention_drivers_analysis": {
         "retention_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "retention_optimization_strategies": "array of strings"
     },
     "product_profitability_drivers_analysis": {
         "profitability_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "profitability_improvement_recommendations": "array of strings"
     },
     "brand_reputation_drivers_analysis": {
         "reputation_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "reputation_management_strategies": "array of strings"
     },
     "customer_service_drivers_analysis": {
         "service_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "service_quality_improvement_recommendations": "array of strings"
     },
     "market_growth_drivers_analysis": {
         "growth_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "growth_acceleration_strategies": "array of strings"
     },
     "competitive_response_drivers_analysis": {
         "response_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "response_strategy_recommendations": "array of strings"
     },
     "customer_feedback_drivers_analysis": {
         "feedback_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "feedback_integration_strategies": "array of strings"
     },
     "product_adoption_drivers_analysis": {
         "adoption_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "adoption_acceleration_recommendations": "array of strings"
     },
     "brand_advocacy_drivers_analysis": {
         "advocacy_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "advocacy_cultivation_strategies": "array of strings"
     },
     "customer_referral_drivers_analysis": {
         "referral_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "referral_program_optimization_recommendations": "array of strings"
     },
     "market_opportunity_drivers_analysis": {
         "opportunity_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "opportunity_pursuit_strategies": "array of strings"
     },
     "competitive_vulnerability_drivers_analysis": {
         "vulnerability_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "vulnerability_reduction_strategies": "array of strings"
     },
     "customer_success_drivers_analysis": {
         "success_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "customer_success_optimization_recommendations": "array of strings"
     },
     "product_differentiation_drivers_analysis": {
         "differentiation_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "differentiation_strategy_recommendations": "array of strings"
     },
     "brand_trust_drivers_analysis": {
         "trust_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "trust_building_strategies": "array of strings"
     },
     "customer_segmentation_drivers_analysis": {
         "segmentation_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "segmentation_optimization_recommendations": "array of strings"
     },
     "market_penetration_drivers_analysis": {
         "penetration_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "penetration_enhancement_strategies": "array of strings"
     },
     "competitive_intelligence_drivers_analysis": {
         "intelligence_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "intelligence_gathering_optimization_recommendations": "array of strings"
     },
     "customer_onboarding_drivers_analysis": {
         "onboarding_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "onboarding_process_improvement_strategies": "array of strings"
     },
     "product_lifecycle_drivers_analysis": {
         "lifecycle_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "lifecycle_management_optimization_recommendations": "array of strings"
     },
     "brand_positioning_drivers_analysis": {
         "positioning_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "positioning_strategy_recommendations": "array of strings"
     },
     "customer_win_back_drivers_analysis": {
         "win_back_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "win_back_campaign_optimization_strategies": "array of strings"
     },
     "market_sizing_drivers_analysis": {
         "sizing_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "market_sizing_methodology_recommendations": "array of strings"
     },
     "competitive_benchmarking_drivers_analysis": {
         "benchmarking_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "benchmarking_process_improvement_strategies": "array of strings"
     },
     "customer_experience_measurement_drivers_analysis": {
         "measurement_drivers": "array of strings",
         "driver_impact_scores": "array of numbers (0-1)",
         "experience_measurement_optimization_recommendations": "array of strings"
     },
     "leadership_style_assessment": {
    "leadership_style": "string",
    "key_characteristics": "array of strings",
    "effectiveness_score": "number (0-1)"
  },
  "team_dynamics_analysis": {
    "team_roles": "array of strings", 
    "collaboration_level": "string",
    "conflict_management": "string"
  },
  "decision_making_process_evaluation": {
    "decision_making_style": "string",
    "influencing_factors": "array of strings",
    "effectiveness_score": "number (0-1)"
  },
  "innovation_potential_assessment": {
    "innovation_level": "string",
    "key_drivers": "array of strings",
    "implementation_feasibility": "string"
  },
  "change_management_effectiveness": {
    "change_readiness": "string",
    "resistance_factors": "array of strings",
    "implementation_success_score": "number (0-1)"
  },
  "diversity_and_inclusion_analysis": {
    "diversity_level": "string",
    "inclusion_practices": "array of strings",
    "improvement_areas": "array of strings"
  },
  "employee_engagement_assessment": {
    "engagement_level": "string",
    "key_drivers": "array of strings",
    "improvement_recommendations": "array of strings"  
  },
  "customer_segmentation_analysis": {
    "customer_segments": "array of objects",
    "segment_characteristics": "array of strings",
    "targeting_strategies": "array of strings"
  },
  "brand_perception_analysis": {
    "brand_associations": "array of strings",
    "perception_score": "number (0-1)",
    "improvement_areas": "array of strings"
  },
  "competitive_landscape_analysis": {
    "key_competitors": "array of strings",
    "competitive_advantages": "array of strings", 
    "market_positioning": "string"
  },
  "product_usability_evaluation": {
    "usability_score": "number (0-1)",
    "key_issues": "array of strings",
    "improvement_recommendations": "array of strings"
  },
  "customer_journey_mapping": {
    "journey_stages": "array of strings",
    "pain_points": "array of strings",
    "improvement_opportunities": "array of strings"
  },
  "brand_loyalty_assessment": {
    "loyalty_level": "string",
    "key_drivers": "array of strings",
    "retention_strategies": "array of strings"
  },
  "market_trend_forecasting": {
    "trend_predictions": "array of strings",
    "likelihood_scores": "array of numbers (0-1)",
    "impact_assessment": "string"
  },
  "consumer_behavior_analysis": {
    "behavior_patterns": "array of strings",
    "influencing_factors": "array of strings",
    "targeting_recommendations": "array of strings"
  },
  "brand_messaging_effectiveness": {
    "message_clarity_score": "number (0-1)",
    "resonance_level": "string",
    "improvement_suggestions": "array of strings"
  },
  "customer_churn_prediction": {
    "churn_likelihood": "number (0-1)",
    "key_risk_factors": "array of strings",
    "retention_strategies": "array of strings"
  },
  "market_segmentation_analysis": {
    "market_segments": "array of objects",
    "segment_size": "array of numbers",
    "segment_characteristics": "array of strings"
  },
  "product_feature_analysis": {
    "key_features": "array of strings",
    "user_satisfaction_scores": "array of numbers (0-1)",
    "improvement_priorities": "array of strings"
  },
  "advertising_effectiveness_evaluation": {
    "engagement_rate": "number (0-1)",
    "conversion_rate": "number (0-1)",
    "roi_assessment": "string"
  },
  "brand_equity_measurement": {
    "brand_equity_score": "number (0-1)",
    "key_contributing_factors": "array of strings",
    "improvement_strategies": "array of strings"
  },
  "customer_satisfaction_drivers_analysis": {
    "satisfaction_drivers": "array of strings",
    "impact_scores": "array of numbers (0-1)",
    "prioritization_matrix": "object"
  },
  "market_sizing_estimation": {
    "market_size_estimate": "number",
    "growth_rate": "number (0-1)",
    "key_assumptions": "array of strings"
  },
  "competitor_benchmarking_analysis": {
    "benchmarking_criteria": "array of strings",
    "competitor_scores": "array of objects",
    "competitive_positioning": "string"
  },
  "customer_persona_development": {
    "persona_profiles": "array of objects",
    "key_characteristics": "array of strings",
    "targeting_strategies": "array of strings"
  },
  "product_pricing_optimization": {
    "optimal_price_range": "string",
    "price_elasticity": "number",
    "pricing_strategy_recommendations": "array of strings"
  },
  "brand_architecture_assessment": {
    "brand_hierarchy": "object",
    "brand_relationships": "array of strings",
    "architecture_effectiveness_score": "number (0-1)"
  },
  "customer_lifetime_value_analysis": {
    "average_customer_lifetime_value": "number",
    "key_drivers": "array of strings",
    "optimization_strategies": "array of strings"
  },
  "market_entry_strategy_evaluation": {
    "market_attractiveness_score": "number (0-1)",
    "entry_barriers": "array of strings",
    "recommended_entry_strategies": "array of strings"
  },
  "brand_positioning_assessment": {
    "current_positioning": "string",
    "target_positioning": "string",
    "repositioning_strategies": "array of strings"
  },
  "customer_feedback_sentiment_analysis": {
    "sentiment_distribution": "object",
    "key_themes": "array of strings",
    "actionable_insights": "array of strings"
  },
  "market_demand_forecasting": {
    "demand_forecast": "object",
    "key_drivers": "array of strings",
    "forecast_accuracy_score": "number (0-1)"
  },
  "competitive_pricing_analysis": {
    "competitor_pricing": "array of objects",
    "pricing_strategy_effectiveness": "string",
    "optimization_recommendations": "array of strings"
  },
  "customer_segmentation_targeting_analysis": {
    "target_segments": "array of objects",
    "targeting_criteria": "array of strings",
    "expected_impact": "string"
  },
  "product_portfolio_optimization": {
    "optimal_product_mix": "array of strings",
    "portfolio_performance_score": "number (0-1)",
    "optimization_strategies": "array of strings"
  },
  "brand_tracking_analysis": {
    "brand_health_metrics": "object",
    "trend_analysis": "string",
    "strategic_recommendations": "array of strings"
  },
  "customer_experience_journey_analysis": {
    "experience_touchpoints": "array of strings",
    "experience_ratings": "array of numbers (0-1)",
    "improvement_priorities": "array of strings"
  },
  "market_basket_analysis": {
    "product_associations": "array of objects",
    "cross_selling_opportunities": "array of strings",
    "revenue_impact_estimate": "number"
  },
  "price_sensitivity_analysis": {
    "price_sensitivity_score": "number (0-1)",
    "optimal_price_points": "array of numbers",
    "revenue_optimization_strategies": "array of strings"
  },
  "brand_extension_evaluation": {
    "extension_fit_score": "number (0-1)",
    "brand_impact_assessment": "string",
    "extension_potential": "string"
  },
  "customer_retention_strategy_analysis": {
    "retention_drivers": "array of strings",
    "churn_risk_assessment": "string",
    "retention_program_recommendations": "array of strings"
  },
  "market_penetration_analysis": {
    "current_penetration_rate": "number (0-1)",
    "growth_potential_score": "number (0-1)",
    "penetration_strategies": "array of strings"
  },
  "competitive_advantage_assessment": {
    "key_competitive_advantages": "array of strings",
    "sustainability_score": "number (0-1)",
    "leveraging_strategies": "array of strings"
  },
  "customer_profitability_analysis": {
    "customer_profitability_segments": "array of objects",
    "profitability_drivers": "array of strings",
    "optimization_opportunities": "array of strings"
  },
  "product_cannibalization_assessment": {
    "cannibalization_risk_score": "number (0-1)",
    "impacted_products": "array of strings",
    "mitigation_strategies": "array of strings"
  },
  "brand_value_proposition_evaluation": {
    "value_proposition_strength_score": "number (0-1)",
    "key_value_drivers": "array of strings",
    "optimization_recommendations": "array of strings"
  },
  "customer_acquisition_channel_analysis": {
    "acquisition_channel_performance": "array of objects",
    "optimal_channel_mix": "object",
    "budget_allocation_recommendations": "object"
  },
  "market_share_analysis": {
    "current_market_share": "number (0-1)",
    "market_share_trend": "string",
    "share_gain_strategies": "array of strings"
  },
  "competitive_positioning_mapping": {
    "positioning_map": "object",
    "competitive_landscape_assessment": "string",
    "repositioning_opportunities": "array of strings"
  },
  "customer_loyalty_program_effectiveness": {
    "program_engagement_score": "number (0-1)",
    "loyalty_drivers": "array of strings",
    "program_optimization_strategies": "array of strings"
  },
  "product_bundling_analysis": {
    "optimal_product_bundles": "array of objects",
    "bundling_impact_assessment": "string",
    "implementation_recommendations": "array of strings"
  },
  "brand_personality_assessment": {
    "brand_personality_traits": "array of strings",
    "brand_personality_consistency_score": "number (0-1)",
    "alignment_recommendations": "array of strings"
  },
  "customer_service_quality_evaluation": {
    "service_quality_score": "number (0-1)",
    "key_service_attributes": "array of strings",
    "improvement_areas": "array of strings"
  },
  "market_opportunity_assessment": {
    "opportunity_attractiveness_score": "number (0-1)",
    "key_success_factors": "array of strings",
    "recommended_pursuit_strategies": "array of strings"
  },
  "competitive_threat_assessment": {
    "key_competitive_threats": "array of strings",
    "threat_impact_scores": "array of numbers (0-1)",
    "mitigation_strategies": "array of strings"
  },
  "customer_needs_analysis": {
    "key_customer_needs": "array of strings",
    "need_importance_scores": "array of numbers (0-1)",
    "unmet_needs": "array of strings"
  },
    "product_innovation_opportunities": {
    "innovation_areas": "array of strings",
    "market_potential_score": "number (0-1)", 
    "feasibility_assessment": "string"
  },
  "brand_awareness_measurement": {
    "awareness_level": "string",
    "awareness_channels": "array of strings",
    "brand_recall_score": "number (0-1)"
  },
  "customer_segmentation_effectiveness": {
    "segment_distinctiveness_score": "number (0-1)",
    "segment_actionability_assessment": "string",
    "optimization_recommendations": "array of strings"
  },
  "product_cannibalization_risk_assessment": {
    "cannibalization_risk_score": "number (0-1)",
    "at_risk_products": "array of strings",
    "mitigation_strategies": "array of strings"
  },
  "brand_loyalty_drivers_analysis": {
    "loyalty_drivers": "array of strings",
    "driver_impact_scores": "array of numbers (0-1)",
    "loyalty_enhancement_strategies": "array of strings"
  },
  "customer_lifetime_value_prediction": {
    "predicted_lifetime_value": "number",
    "key_value_drivers": "array of strings",
    "value_maximization_strategies": "array of strings"
  },
  "market_basket_analysis_product_affinity": {
    "product_affinities": "array of objects",
    "cross_selling_potential": "string",
    "bundle_recommendations": "array of strings"
  },
  "price_elasticity_measurement": {
    "price_elasticity_score": "number",
    "optimal_price_range": "string",
    "revenue_impact_projection": "string"
  },
  "brand_personality_perception_analysis": {
    "perceived_personality_traits": "array of strings",
    "brand_personality_alignment_score": "number (0-1)",
    "personality_refinement_strategies": "array of strings"
  },
  "customer_churn_risk_prediction": {
    "churn_risk_score": "number (0-1)",
    "key_churn_drivers": "array of strings",
    "retention_strategy_recommendations": "array of strings"
  },
  "market_size_estimation": {
    "estimated_market_size": "number",
    "market_growth_rate": "number (0-1)",
    "market_share_potential": "number (0-1)"
  },
  "competitive_intensity_assessment": {
    "competitive_intensity_score": "number (0-1)",
    "key_competitors": "array of strings",
    "competitive_differentiation_strategies": "array of strings"
  },
  "customer_satisfaction_measurement": {
    "satisfaction_score": "number (0-1)",
    "key_satisfaction_drivers": "array of strings",
    "improvement_priorities": "array of strings"
  },
  "product_feature_preference_analysis": {
    "preferred_features": "array of strings",
    "feature_importance_scores": "array of numbers (0-1)",
    "feature_optimization_recommendations": "array of strings"
  },
  "brand_perception_gap_analysis": {
    "perceived_brand_attributes": "array of strings",
    "desired_brand_attributes": "array of strings",
    "perception_gap_assessment": "string"
  },
  "customer_complaint_root_cause_analysis": {
    "root_causes": "array of strings",
    "occurrence_frequency": "array of numbers",
    "resolution_effectiveness_score": "number (0-1)"
  },
  "market_trend_impact_assessment": {
    "relevant_trends": "array of strings",
    "trend_impact_scores": "array of numbers (0-1)",
    "trend_leverage_strategies": "array of strings"
  },
  "competitive_price_benchmarking": {
    "competitor_prices": "array of objects",
    "price_competitiveness_score": "number (0-1)",
    "price_adjustment_recommendations": "array of strings"
  },
  "customer_service_performance_evaluation": {
    "service_performance_metrics": "object",
    "service_quality_score": "number (0-1)",
    "service_improvement_areas": "array of strings"
  },
  "product_usage_pattern_analysis": {
    "usage_patterns": "array of strings",
    "usage_intensity_score": "number (0-1)",
    "product_optimization_insights": "array of strings"
  },
  "brand_advocacy_measurement": {
    "brand_advocacy_score": "number (0-1)",
    "key_advocacy_drivers": "array of strings",
    "advocacy_cultivation_strategies": "array of strings"
  },
  "customer_journey_mapping_analysis": {
    "journey_stages": "array of strings",
    "stage_satisfaction_scores": "array of numbers (0-1)",
    "journey_optimization_recommendations": "array of strings"
  },
  "market_whitespace_identification": {
    "whitespace_opportunities": "array of strings",
    "opportunity_attractiveness_scores": "array of numbers (0-1)",
    "market_entry_strategies": "array of strings"
  },
  "competitive_strength_assessment": {
    "competitive_strengths": "array of strings",
    "relative_strength_scores": "array of numbers (0-1)",
    "strength_leveraging_strategies": "array of strings"
  },
  "customer_referral_behavior_analysis": {
    "referral_likelihood_score": "number (0-1)",
    "key_referral_drivers": "array of strings",
    "referral_program_optimization_strategies": "array of strings"
  },
  "product_profitability_analysis": {
    "product_profitability_metrics": "object",
    "profitability_improvement_areas": "array of strings",
    "profit_optimization_recommendations": "array of strings"
  },
  "brand_elements_effectiveness_evaluation": {
    "brand_elements": "array of strings",
    "effectiveness_scores": "array of numbers (0-1)",
    "brand_element_refinement_strategies": "array of strings"
  },
  "customer_onboarding_process_evaluation": {
    "onboarding_process_steps": "array of strings",
    "step_completion_rates": "array of numbers (0-1)",
    "onboarding_optimization_recommendations": "array of strings"
  },
  "market_growth_driver_analysis": {
    "growth_drivers": "array of strings",
    "driver_impact_scores": "array of numbers (0-1)",
    "growth_acceleration_strategies": "array of strings"
  },
  "competitive_vulnerability_assessment": {
    "competitive_vulnerabilities": "array of strings",
    "vulnerability_impact_scores": "array of numbers (0-1)",
    "vulnerability_mitigation_strategies": "array of strings"
  },
  "customer_touchpoint_effectiveness_analysis": {
    "customer_touchpoints": "array of strings",
    "touchpoint_effectiveness_scores": "array of numbers (0-1)",
    "touchpoint_optimization_recommendations": "array of strings"
  },
  "product_return_reason_analysis": {
    "return_reasons": "array of strings",
    "reason_frequency_scores": "array of numbers (0-1)",
    "return_reduction_strategies": "array of strings"
  },
  "brand_crisis_management_effectiveness": {
    "crisis_response_effectiveness_score": "number (0-1)",
    "crisis_impact_assessment": "string",
    "crisis_recovery_strategies": "array of strings"
  },
  "customer_retention_program_performance": {
    "retention_program_metrics": "object",
    "program_effectiveness_score": "number (0-1)",
    "program_optimization_recommendations": "array of strings"
  },
  "market_entry_barrier_analysis": {
    "entry_barriers": "array of strings",
    "barrier_impact_scores": "array of numbers (0-1)",
    "barrier_mitigation_strategies": "array of strings"
  },
  "competitive_response_scenario_planning": {
    "competitive_scenarios": "array of objects",
    "scenario_likelihood_scores": "array of numbers (0-1)",
    "scenario_response_strategies": "array of objects"
  },
  "customer_win_back_strategy_effectiveness": {
    "win_back_success_rate": "number (0-1)",
    "key_win_back_drivers": "array of strings",
    "win_back_strategy_refinement_recommendations": "array of strings"
  },
  "product_line_extension_evaluation": {
    "extension_opportunities": "array of strings",
    "extension_feasibility_scores": "array of numbers (0-1)",
    "extension_prioritization_recommendations": "array of strings"
  },
  "brand_partnership_opportunity_assessment": {
    "potential_partners": "array of strings",
    "partnership_fit_scores": "array of numbers (0-1)",
    "partnership_strategy_recommendations": "array of strings"
  },
  "customer_experience_friction_point_analysis": {
    "friction_points": "array of strings",
    "friction_severity_scores": "array of numbers (0-1)",
    "friction_reduction_strategies": "array of strings"
  },
  "product_demand_forecasting_accuracy": {
    "forecasting_accuracy_score": "number (0-1)",
    "key_accuracy_drivers": "array of strings",
    "forecasting_process_improvement_recommendations": "array of strings"
  },
  "brand_reputation_monitoring_effectiveness": {
    "reputation_sentiment_score": "number (0-1)",
    "key_reputation_influencers": "array of strings",
    "reputation_management_best_practices": "array of strings"
  },
  "customer_service_channel_preference_analysis": {
    "preferred_service_channels": "array of strings",
    "channel_preference_scores": "array of numbers (0-1)",
    "channel_optimization_strategies": "array of strings"
  },
  "market_segmentation_stability_assessment": {
    "segment_stability_score": "number (0-1)",
    "segment_evolution_trends": "array of strings",
    "segmentation_refresh_recommendations": "array of strings"
  },
  "competitive_market_share_change_analysis": {
    "market_share_change_percentages": "object",
    "key_change_drivers": "array of strings",
    "share_defense_strategies": "array of strings"
  },
  "customer_loyalty_program_roi_measurement": {
    "loyalty_program_roi": "number",
    "roi_improvement_areas": "array of strings",
    "roi_optimization_strategies": "array of strings"
  },
  "product_pricing_strategy_simulation": {
    "pricing_scenarios": "array of objects",
    "scenario_impact_projections": "array of objects",
    "recommended_pricing_strategy": "string"
  },
  "brand_portfolio_optimization_analysis": {
    "portfolio_optimization_opportunities": "array of strings",
    "brand_synergy_scores": "array of numbers (0-1)",
    "portfolio_rationalization_recommendations": "array of strings"
  },
  "customer_behavior_trend_forecasting": {
    "behavior_trend_predictions": "array of strings",
    "trend_impact_scores": "array of numbers (0-1)",
    "proactive_response_strategies": "array of strings"
  },
  "product_attribute_importance_evaluation": {
    "key_product_attributes": "array of strings",
    "attribute_importance_scores": "array of numbers (0-1)",
    "attribute_optimization_recommendations": "array of strings"
  },
    "product_attribute_importance_evaluation": {
    "key_product_attributes": "array of strings",
    "attribute_importance_scores": "array of numbers (0-1)",
    "attribute_optimization_recommendations": "array of strings"
  },
  "process_efficiency_analysis": {
    "process_bottlenecks": "array of strings",
    "process_waste": "array of strings",
    "process_improvement_opportunities": "array of strings"
  },
  "capacity_utilization_analysis": {
    "utilization_rate": "number (0-1)",
    "capacity_constraints": "array of strings",
    "optimization_recommendations": "array of strings"
  },
  "inventory_optimization_analysis": {
    "optimal_inventory_levels": "object",
    "inventory_turnover_rate": "number",
    "inventory_reduction_strategies": "array of strings"
  },
  "supply_chain_risk_assessment": {
    "risk_factors": "array of strings",
    "risk_impact_scores": "array of numbers (0-1)",
    "risk_mitigation_strategies": "array of strings"
  },
  "logistics_network_optimization": {
    "optimized_network_design": "object",
    "cost_reduction_potential": "number",
    "service_level_improvements": "array of strings"
  },
  "demand_forecasting_accuracy_analysis": {
    "forecasting_accuracy_score": "number (0-1)",
    "key_accuracy_drivers": "array of strings",
    "forecasting_improvement_recommendations": "array of strings"
  },
  "supplier_performance_evaluation": {
    "supplier_performance_metrics": "object",
    "supplier_ranking": "array of objects",
    "supplier_development_strategies": "array of strings"
  },
  "quality_control_effectiveness_analysis": {
    "quality_metrics": "object",
    "defect_rates": "object",
    "quality_improvement_initiatives": "array of strings"
  },
  "maintenance_strategy_optimization": {
    "optimal_maintenance_mix": "object",
    "maintenance_cost_reduction": "number",
    "equipment_reliability_improvements": "array of strings"
  },
  "operational_cost_driver_analysis": {
    "cost_drivers": "array of strings",
    "cost_driver_impact_scores": "array of numbers (0-1)",
    "cost_optimization_strategies": "array of strings"
  },
  "production_scheduling_optimization": {
    "optimized_production_schedule": "object",
    "throughput_improvement": "number",
    "resource_utilization_optimization": "array of strings"
  },
  "facility_location_analysis": {
    "optimal_facility_locations": "array of objects",
    "location_selection_criteria": "array of strings",
    "location_impact_assessment": "object"
  },
  "warranty_claim_root_cause_analysis": {
    "root_causes": "array of strings",
    "claim_frequency_scores": "array of numbers (0-1)",
    "warranty_cost_reduction_strategies": "array of strings"
  },
  "lean_manufacturing_implementation_effectiveness": {
    "lean_implementation_metrics": "object",
    "waste_reduction_achievements": "array of strings",
    "continuous_improvement_recommendations": "array of strings"
  },
  "operational_kpi_benchmarking_analysis": {
    "kpi_benchmarks": "object",
    "performance_gaps": "object",
    "best_practice_adoption_strategies": "array of strings"
  },
  "inventory_turnover_optimization": {
    "inventory_turnover_ratio": "number",
    "optimal_inventory_policies": "object",
    "working_capital_reduction_strategies": "array of strings"
  },
  "order_fulfillment_process_evaluation": {
    "order_fulfillment_metrics": "object",
    "process_pain_points": "array of strings",
    "fulfillment_optimization_strategies": "array of strings"
  },
  "reverse_logistics_efficiency_analysis": {
    "reverse_logistics_cost_ratio": "number",
    "return_process_inefficiencies": "array of strings",
    "reverse_logistics_optimization_recommendations": "array of strings"
  },
  "operational_risk_mitigation_strategy_analysis": {
    "operational_risks": "array of strings",
    "risk_mitigation_effectiveness_scores": "array of numbers (0-1)",
    "risk_management_improvement_strategies": "array of strings"
  },
  "production_line_balancing_analysis": {
    "line_balancing_efficiency": "number (0-1)",
    "bottleneck_operations": "array of strings",
    "line_balancing_optimization_recommendations": "array of strings"
  },
  "system_performance_analysis": {
    "performance_metrics": "object",
    "system_bottlenecks": "array of strings",
    "performance_optimization_strategies": "array of strings"
  },
  "user_adoption_and_engagement_analysis": {
    "adoption_rate": "number (0-1)",
    "engagement_metrics": "object",
    "user_experience_improvement_recommendations": "array of strings"
  },
  "data_quality_assessment": {
    "data_quality_scores": "object",
    "data_quality_issues": "array of strings",
    "data_governance_improvement_strategies": "array of strings"
  },
  "cybersecurity_risk_assessment": {
    "risk_factors": "array of strings",
    "risk_impact_scores": "array of numbers (0-1)",
    "security_control_recommendations": "array of strings"
  },
  "it_infrastructure_capacity_planning": {
    "capacity_utilization_metrics": "object",
    "future_capacity_requirements": "object",
    "infrastructure_optimization_strategies": "array of strings"
  },
  "software_development_process_evaluation": {
    "development_process_metrics": "object",
    "process_inefficiencies": "array of strings",
    "agile_practices_adoption_recommendations": "array of strings"
  },
  "cloud_migration_feasibility_analysis": {
    "migration_feasibility_score": "number (0-1)",
    "migration_benefits": "array of strings",
    "migration_roadmap": "object"
  },
  "it_service_desk_performance_analysis": {
    "service_desk_metrics": "object",
    "performance_gaps": "array of strings",
    "service_improvement_initiatives": "array of strings"
  },
  "technology_roi_assessment": {
    "roi_metrics": "object",
    "investment_justification": "string",
    "value_realization_strategies": "array of strings"
  },
  "it_project_portfolio_optimization": {
    "optimized_project_portfolio": "array of objects",
    "portfolio_alignment_score": "number (0-1)",
    "resource_allocation_recommendations": "array of strings"
  },
  "system_integration_effectiveness_analysis": {
    "integration_effectiveness_score": "number (0-1)",
    "integration_challenges": "array of strings",
    "integration_architecture_improvement_strategies": "array of strings"
  },
  "it_asset_management_optimization": {
    "asset_utilization_metrics": "object",
    "asset_lifecycle_management_inefficiencies": "array of strings",
    "asset_optimization_strategies": "array of strings"
  },
  "technology_vendor_performance_evaluation": {
    "vendor_performance_metrics": "object",
    "vendor_ranking": "array of objects",
    "vendor_management_improvement_recommendations": "array of strings"
  },
  "it_service_level_agreement_compliance_analysis": {
    "sla_compliance_scores": "object",
    "service_level_breaches": "array of strings",
    "sla_management_improvement_strategies": "array of strings"
  },
  "it_disaster_recovery_plan_effectiveness": {
    "recovery_time_objectives": "object",
    "recovery_point_objectives": "object",
    "disaster_recovery_improvement_recommendations": "array of strings"
  },
  "technology_skill_gap_analysis": {
    "skill_gap_assessment": "object",
    "skill_development_priorities": "array of strings",
    "talent_management_strategies": "array of strings"
  },
  "it_budget_allocation_optimization": {
    "optimized_budget_allocation": "object",
    "cost_saving_opportunities": "array of strings",
    "it_investment_prioritization_recommendations": "array of strings"
  },
  "technology_trend_impact_assessment": {
    "relevant_technology_trends": "array of strings",
    "trend_impact_scores": "array of numbers (0-1)",
    "technology_adoption_strategies": "array of strings"
  },
  "it_change_management_effectiveness": {
    "change_success_rate": "number (0-1)",
    "change_management_challenges": "array of strings",
    "change_management_process_improvement_recommendations": "array of strings"
  },
  "technology_risk_mitigation_strategy_analysis": {
    "technology_risks": "array of strings",
    "risk_mitigation_effectiveness_scores": "array of numbers (0-1)",
    "risk_management_improvement_strategies": "array of strings"
  },
  "asset_condition_assessment": {
    "asset_health_scores": "object",
    "asset_failure_risks": "array of strings",
    "asset_maintenance_optimization_recommendations": "array of strings"
  },
  "maintenance_strategy_optimization": {
    "optimal_maintenance_mix": "object",
    "maintenance_cost_reduction": "number",
    "asset_reliability_improvements": "array of strings"
  },
  "capacity_utilization_analysis": {
    "utilization_rates": "object",
    "capacity_bottlenecks": "array of strings",
    "capacity_optimization_strategies": "array of strings"
  },
  "energy_consumption_analysis": {
    "energy_consumption_metrics": "object",
    "energy_efficiency_opportunities": "array of strings",
    "energy_management_strategies": "array of strings"
  },
  "infrastructure_performance_benchmarking": {
    "performance_benchmarks": "object",
    "performance_gaps": "object",
    "best_practice_adoption_recommendations": "array of strings"
  },
  "facility_management_effectiveness_analysis": {
    "facility_management_metrics": "object",
    "service_quality_issues": "array of strings",
    "facility_management_improvement_strategies": "array of strings"
  },
  "infrastructure_project_portfolio_optimization": {
    "optimized_project_portfolio": "array of objects",
    "portfolio_alignment_score": "number (0-1)",
    "resource_allocation_recommendations": "array of strings"
  },
  "asset_lifecycle_cost_analysis": {
    "lifecycle_cost_breakdown": "object",
    "cost_reduction_opportunities": "array of strings",
    "asset_replacement_strategies": "array of strings"
  },
  "infrastructure_risk_assessment": {
    "risk_factors": "array of strings",
    "risk_impact_scores": "array of numbers (0-1)",
    "risk_mitigation_strategies": "array of strings"
  },
  "predictive_maintenance_effectiveness": {
    "predictive_maintenance_metrics": "object",
    "maintenance_cost_reduction": "number",
    "asset_uptime_improvements": "array of strings"
  },
  "infrastructure_sustainability_analysis": {
    "sustainability_metrics": "object",
    "environmental_impact_assessment": "string",
    "sustainability_improvement_initiatives": "array of strings"
  }, 
  "infrastructure_sustainability_analysis": {
    "sustainability_metrics": "object",
    "environmental_impact_assessment": "string",
    "sustainability_improvement_initiatives": "array of strings"
  },
  "facility_space_utilization_optimization": {
    "space_utilization_metrics": "object",
    "optimization_recommendations": "array of strings",
    "cost_saving_potential": "number"
  },
  "asset_criticality_analysis": {
    "critical_assets": "array of strings",
    "criticality_scores": "array of numbers (0-1)",
    "risk_mitigation_strategies": "array of strings"
  },
  "infrastructure_service_level_agreement_compliance_analysis": {
    "sla_compliance_scores": "object",
    "non_compliance_instances": "array of objects",
    "sla_improvement_recommendations": "array of strings"
  },
  "infrastructure_disaster_recovery_plan_effectiveness": {
    "recovery_time_objectives": "object",
    "recovery_point_objectives": "object",
    "plan_effectiveness_score": "number (0-1)"
  },
  "infrastructure_budget_allocation_optimization": {
    "optimized_budget_allocation": "object",
    "cost_saving_opportunities": "array of strings",
    "risk_reduction_strategies": "array of strings"
  },
  "infrastructure_safety_compliance_analysis": {
    "safety_compliance_score": "number (0-1)",
    "non_compliance_areas": "array of strings",
    "safety_improvement_recommendations": "array of strings"
  },
  "infrastructure_change_management_effectiveness": {
    "change_success_rate": "number (0-1)",
    "change_impact_assessment": "string",
    "change_management_process_improvements": "array of strings"
  },
  "infrastructure_asset_management_optimization": {
    "asset_performance_metrics": "object",
    "asset_lifecycle_optimization_strategies": "array of strings",
    "maintenance_cost_reduction_potential": "number"
  }  
}
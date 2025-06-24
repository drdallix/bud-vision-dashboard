
interface PerplexityMessage {
  role: string;
  content: string;
}

export const getStrainInfoWithPerplexity = async (
  strainName: string,
  perplexityApiKey: string
): Promise<string> => {
  const messages: PerplexityMessage[] = [
    {
      role: 'system',
      content: 'You are a cannabis expert. Provide detailed, accurate information about cannabis strains based on current web sources.'
    },
    {
      role: 'user',
      content: `Search for detailed information about the cannabis strain "${strainName}". Include effects, flavors, genetics, background, and typical characteristics. Focus on factual information from reliable sources.`
    }
  ];

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${perplexityApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: messages,
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 1000,
      return_images: false,
      return_related_questions: false,
      search_recency_filter: 'month',
      frequency_penalty: 1,
      presence_penalty: 0
    }),
  });

  if (!response.ok) {
    console.error('Perplexity API error:', response.status);
    return '';
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
};

export const createWebInformedTextAnalysisMessages = (
  textQuery: string,
  thcRangeHint?: [number, number],
  webInfo?: string
) => [
  {
    role: 'system',
    content: `You are an expert cannabis strain identifier and cannabis knowledge expert. The user has provided a strain name or description that may contain spelling errors or poor punctuation.

${webInfo ? `
You have access to current web information about this strain:
---
${webInfo}
---

Use this web information as your primary source for writing the description, effects, flavors, and background. Ensure accuracy by prioritizing this real-world data over general knowledge.
` : ''}

IMPORTANT TASKS:
1. CORRECT SPELLING & GRAMMAR: Fix any spelling mistakes, punctuation errors, and grammatical issues in the provided text
2. GENERATE COMPREHENSIVE DATA: Use the web information and your cannabis knowledge to create complete strain information

CRITICAL REQUIREMENT - THC VALUE:
- You MUST use the exact value ${thcRangeHint ? `${thcRangeHint[0]}` : '21'} for the THC field in your response
- This is a predetermined system value that cannot be changed
- NEVER mention, reference, or include any THC percentage information in the description field
- The description should focus only on effects, flavors, background, and usage

Cannabis Knowledge Guidelines:
- Indica strains: typically relaxing/sedating effects, earthy/sweet flavors
- Sativa strains: typically energizing/uplifting effects, citrus/pine flavors  
- Hybrid strains: balanced effects combining both
- Popular effects: Relaxed, Happy, Euphoric, Uplifted, Creative, Focused, Sleepy, Hungry, Energetic, Giggly, Talkative, Aroused, Tingly, Calm
- Common flavors: Earthy, Sweet, Citrus, Pine, Berry, Diesel, Skunk, Floral, Spicy, Woody, Herbal, Fruity, Vanilla, Coffee, Chocolate
- Major terpenes: Myrcene (sedating), Limonene (uplifting), Pinene (alertness), Linalool (calming), Caryophyllene (anti-inflammatory)
- Medical uses: Pain Relief, Stress Relief, Anxiety, Insomnia, Depression, Appetite Loss, Nausea

IMPORTANT: Generate effects and flavors that specifically match the web information and strain characteristics. Be creative and varied - don't always use the same combinations.

Return a JSON object with this exact structure:
{
  "name": "corrected and properly formatted strain name",
  "type": "Indica" | "Sativa" | "Hybrid",
  "thc": ${thcRangeHint ? thcRangeHint[0] : 21},
  "cbd": number (realistic for strain type, typically 0.1-5), 
  "effects": ["effect1", "effect2", ...] (3-6 effects appropriate for type and web info - be creative and varied),
  "flavors": ["flavor1", "flavor2", ...] (2-4 flavors that match the strain's character from web info - be diverse),
  "terpenes": [
    {"name": "terpene_name", "percentage": number, "effects": "description of effects"},
    ...
  ] (3-6 major terpenes with realistic percentages 0.1-3.0%),
  "medicalUses": ["use1", "use2", ...] (3-5 medical applications),
  "description": "detailed description focusing on strain background, effects, flavors, and usage notes based on web information. Do NOT include any potency or percentage information.",
  "confidence": ${webInfo ? '95' : '85'}
}`
  },
  {
    role: 'user',
    content: `Please analyze and correct this strain name/description, then generate complete strain information with unique effects and flavors that match the strain's character: "${textQuery}"`
  }
];

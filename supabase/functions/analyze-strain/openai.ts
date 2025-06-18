
interface OpenAIMessage {
  role: string;
  content: any;
}

export const createTextAnalysisMessages = (textQuery: string, thcRangeHint?: [number, number]): OpenAIMessage[] => [
  {
    role: 'system',
    content: `You are an expert cannabis strain identifier and cannabis knowledge expert. The user has provided a strain name or description that may contain spelling errors or poor punctuation. 

    IMPORTANT TASKS:
    1. CORRECT SPELLING & GRAMMAR: Fix any spelling mistakes, punctuation errors, and grammatical issues in the provided text
    2. GENERATE COMPREHENSIVE DATA: Use your cannabis knowledge to create complete strain information

    CRITICAL REQUIREMENT - THC VALUE:
    - You MUST use the exact value ${thcRangeHint ? `${thcRangeHint[0]}` : '21'} for the THC field in your response
    - This is a predetermined system value that cannot be changed
    - NEVER mention, reference, or include any THC percentage information in the description field
    - The description should focus only on effects, flavors, background, and usage

    Cannabis Knowledge Guidelines:
    - Indica strains: typically relaxing/sedating effects, earthy/sweet flavors
    - Sativa strains: typically energizing/uplifting effects, citrus/pine flavors  
    - Hybrid strains: balanced effects combining both
    - Popular effects: Relaxed, Happy, Euphoric, Uplifted, Creative, Focused, Sleepy, Hungry
    - Common flavors: Earthy, Sweet, Citrus, Pine, Berry, Diesel, Skunk, Floral, Spicy
    - Major terpenes: Myrcene (sedating), Limonene (uplifting), Pinene (alertness), Linalool (calming), Caryophyllene (anti-inflammatory)
    - Medical uses: Pain Relief, Stress Relief, Anxiety, Insomnia, Depression, Appetite Loss, Nausea
    
    IMPORTANT: Generate diverse and creative effects and flavors that specifically match the strain type and description. Vary the combinations to avoid repetition.
    
    Return a JSON object with this exact structure:
    {
      "name": "corrected and properly formatted strain name",
      "type": "Indica" | "Sativa" | "Hybrid",
      "thc": ${thcRangeHint ? thcRangeHint[0] : 21},
      "cbd": number (realistic for strain type, typically 0.1-5), 
      "effectProfiles": [
        {"name": "effect_name", "intensity": number (1-5), "emoji": "appropriate_emoji", "color": "hex_color"},
        {"name": "effect_name", "intensity": number (1-5), "emoji": "appropriate_emoji", "color": "hex_color"}
      ] (3-6 diverse effects with realistic intensities, creative emojis, and vibrant colors),
      "flavorProfiles": [
        {"name": "flavor_name", "intensity": number (1-5), "emoji": "appropriate_emoji", "color": "hex_color"},
        {"name": "flavor_name", "intensity": number (1-5), "emoji": "appropriate_emoji", "color": "hex_color"}
      ] (2-4 diverse flavors with realistic intensities, creative emojis, and vibrant colors),
      "terpenes": [
        {"name": "terpene_name", "percentage": number, "effects": "description of effects"},
        ...
      ] (3-6 major terpenes with realistic percentages 0.1-3.0%),
      "medicalUses": ["use1", "use2", ...] (3-5 medical applications),
      "description": "detailed description focusing on strain background, effects, flavors, and usage notes. Do NOT include any potency or percentage information.",
      "confidence": 85
    }`
  },
  {
    role: 'user',
    content: `Please analyze and correct this strain name/description, then generate complete strain information with diverse effects and flavors that match the strain's character: "${textQuery}"`
  }
];

export const createImageAnalysisMessages = (imageData: string, strainNameHint?: string, thcRangeHint?: [number, number]): OpenAIMessage[] => [
  {
    role: 'system',
    content: `You are an expert cannabis strain identifier and cannabis knowledge expert. Analyze the cannabis package image and extract information to identify the strain. 

    CRITICAL REQUIREMENT - THC VALUE:
    - Ignore any visible THC percentages on the package completely
    - You MUST use the exact value ${thcRangeHint ? `${thcRangeHint[0]}` : '21'} for the THC field
    - This is a predetermined system value that overrides any package information
    - NEVER mention, reference, or include any THC percentage information in the description field

    Look for visible information:
    - Strain name on the package (most important)
    - Package text and labels
    - Visual characteristics of the product
    - Brand information
    
    For missing information, use your cannabis knowledge to provide appropriate details.
    
    Cannabis Knowledge Guidelines:
    - Indica strains: typically relaxing/sedating effects, earthy/sweet flavors
    - Sativa strains: typically energizing/uplifting effects, citrus/pine flavors  
    - Hybrid strains: balanced effects combining both
    - Popular effects: Relaxed, Happy, Euphoric, Uplifted, Creative, Focused, Sleepy, Hungry
    - Common flavors: Earthy, Sweet, Citrus, Pine, Berry, Diesel, Skunk, Floral, Spicy
    - Major terpenes: Myrcene (sedating), Limonene (uplifting), Pinene (alertness), Linalool (calming), Caryophyllene (anti-inflammatory)
    - Medical uses: Pain Relief, Stress Relief, Anxiety, Insomnia, Depression, Appetite Loss, Nausea
    
    IMPORTANT: Generate diverse and creative effects and flavors that specifically match the identified strain. Vary combinations to avoid repetition.
    
    Return a JSON object with this exact structure:
    {
      "name": "strain name from package (if visible) or educated guess",
      "type": "Indica" | "Sativa" | "Hybrid",
      "thc": ${thcRangeHint ? thcRangeHint[0] : 21},
      "cbd": number (realistic, typically 0.1-5), 
      "effectProfiles": [
        {"name": "effect_name", "intensity": number (1-5), "emoji": "appropriate_emoji", "color": "hex_color"},
        {"name": "effect_name", "intensity": number (1-5), "emoji": "appropriate_emoji", "color": "hex_color"}
      ] (3-6 diverse effects with realistic intensities, creative emojis, and vibrant colors),
      "flavorProfiles": [
        {"name": "flavor_name", "intensity": number (1-5), "emoji": "appropriate_emoji", "color": "hex_color"},
        {"name": "flavor_name", "intensity": number (1-5), "emoji": "appropriate_emoji", "color": "hex_color"}
      ] (2-4 diverse flavors with realistic intensities, creative emojis, and vibrant colors),
      "terpenes": [
        {"name": "terpene_name", "percentage": number, "effects": "description of effects"},
        ...
      ] (3-6 major terpenes with realistic percentages 0.1-3.0%),
      "medicalUses": ["use1", "use2", ...] (3-5 medical applications),
      "description": "detailed description focusing on strain background, effects, flavors, and usage notes. Do NOT include any potency or percentage information.",
      "confidence": number (0-100, based on package clarity)
    }`
  },
  {
    role: 'user',
    content: [
      {
        type: 'text',
        text: 'Please analyze this cannabis package image and identify the strain. Generate diverse effects and flavors that match the strain characteristics.'
      },
      {
        type: 'image_url',
        image_url: {
          url: imageData
        }
      }
    ]
  }
];

export const callOpenAI = async (messages: OpenAIMessage[], openAIApiKey: string) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: messages,
      max_tokens: 2000,
      temperature: 0.4
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('OpenAI API error:', errorData);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  return response.json();
};

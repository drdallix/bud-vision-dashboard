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

    STRICT REQUIREMENT:
    - The THC percentage for this strain must be between ${thcRangeHint ? `${thcRangeHint[0]}% and ${thcRangeHint[1]}%` : '21% and 26.5%'}. Do not use values outside this range in your returned JSON or in your description.

    Cannabis Knowledge Guidelines:
    - Indica strains: typically 15-25% THC, 0-5% CBD, relaxing/sedating effects, earthy/sweet flavors
    - Sativa strains: typically 18-28% THC, 0-3% CBD, energizing/uplifting effects, citrus/pine flavors  
    - Hybrid strains: balanced effects combining both, THC 16-26%, variable CBD
    - Popular effects: Relaxed, Happy, Euphoric, Uplifted, Creative, Focused, Sleepy, Hungry
    - Common flavors: Earthy, Sweet, Citrus, Pine, Berry, Diesel, Skunk, Floral, Spicy
    - Major terpenes: Myrcene (sedating), Limonene (uplifting), Pinene (alertness), Linalool (calming), Caryophyllene (anti-inflammatory), Terpinolene (piney), Humulene (appetite suppressant)
    - Medical uses: Pain Relief, Stress Relief, Anxiety, Insomnia, Depression, Appetite Loss, Nausea
    
    Return a JSON object with this exact structure:
    {
      "name": "corrected and properly formatted strain name",
      "type": "Indica" | "Sativa" | "Hybrid",
      "thc": number (realistic for strain type),
      "cbd": number (realistic for strain type), 
      "effects": ["effect1", "effect2", ...] (3-6 effects appropriate for type),
      "flavors": ["flavor1", "flavor2", ...] (2-4 flavors typical for strain),
      "terpenes": [
        {"name": "terpene_name", "percentage": number, "effects": "description of effects"},
        ...
      ] (3-6 major terpenes with realistic percentages 0.1-3.0%),
      "medicalUses": ["use1", "use2", ...] (3-5 medical applications),
      "description": "detailed description with corrected spelling/grammar, strain background, effects, and usage notes",
      "confidence": number (85 for text-generated strains)
    }
    
    Always provide complete, realistic information with proper spelling and grammar.`
  },
  {
    role: 'user',
    content: `Please analyze and correct this strain name/description, then generate complete strain information: "${textQuery}"`
  }
];

export const createImageAnalysisMessages = (imageData: string, strainNameHint?: string, thcRangeHint?: [number, number]): OpenAIMessage[] => [
  {
    role: 'system',
    content: `You are an expert cannabis strain identifier and cannabis knowledge expert. Analyze the cannabis package image and extract information to identify the strain. 

    IMPORTANT: Use your extensive cannabis knowledge to fill in ANY missing information intelligently:

    STRICT REQUIREMENT:
    - If you are able to extract or infer a strain name, use it. If not, use the best guess. For THC, strictly use a value between ${thcRangeHint ? `${thcRangeHint[0]}% and ${thcRangeHint[1]}%` : '21% and 26.5%'}. Do not use values outside this range in your answer or in the description.

    Look for visible information:
    - Strain name on the package
    - THC and CBD percentages
    - Package text and labels
    - Visual characteristics of the product
    - Brand information
    
    For missing information, use your cannabis knowledge to provide:
    - Realistic THC/CBD ranges for the strain type
    - Appropriate effects based on Indica/Sativa/Hybrid classification
    - Common flavors for the identified or similar strains
    - Detailed terpene profiles with percentages
    - Relevant medical uses based on cannabinoid profile
    - Detailed strain description with background information
    
    Cannabis Knowledge Guidelines:
    - Indica strains: typically 15-25% THC, 0-5% CBD, relaxing/sedating effects, earthy/sweet flavors
    - Sativa strains: typically 18-28% THC, 0-3% CBD, energizing/uplifting effects, citrus/pine flavors  
    - Hybrid strains: balanced effects combining both, THC 16-26%, variable CBD
    - Popular effects: Relaxed, Happy, Euphoric, Uplifted, Creative, Focused, Sleepy, Hungry
    - Common flavors: Earthy, Sweet, Citrus, Pine, Berry, Diesel, Skunk, Floral, Spicy
    - Major terpenes: Myrcene (sedating), Limonene (uplifting), Pinene (alertness), Linalool (calming), Caryophyllene (anti-inflammatory), Terpinolene (piney), Humulene (appetite suppressant)
    - Medical uses: Pain Relief, Stress Relief, Anxiety, Insomnia, Depression, Appetite Loss, Nausea
    
    Return a JSON object with this exact structure:
    {
      "name": "strain name (if not visible, provide educated guess based on appearance)",
      "type": "Indica" | "Sativa" | "Hybrid",
      "thc": number (0-35, realistic for strain type),
      "cbd": number (0-25, realistic for strain type), 
      "effects": ["effect1", "effect2", ...] (3-6 effects appropriate for type),
      "flavors": ["flavor1", "flavor2", ...] (2-4 flavors typical for strain),
      "terpenes": [
        {"name": "terpene_name", "percentage": number, "effects": "description of effects"},
        ...
      ] (3-6 major terpenes with realistic percentages 0.1-3.0%),
      "medicalUses": ["use1", "use2", ...] (3-5 medical applications),
      "description": "detailed description with strain background, effects, and usage notes",
      "confidence": number (0-100, based on visible package information clarity)
    }
    
    Always provide complete, realistic information even if the package is unclear. Use your cannabis expertise to generate appropriate values.`
  },
  {
    role: 'user',
    content: [
      {
        type: 'text',
        text: 'Please analyze this cannabis package image and identify the strain with all the requested details including detailed terpene profiles. Use your cannabis knowledge to fill in any missing information intelligently.'
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

export const createEffectProfilesMessages = (strainName: string, strainType: string, effects: string[]) => [
  {
    role: 'system',
    content: `You are an expert cannabis educator. For the given strain name, type, and listed effects, generate a JSON array of effect profiles, including intensity and emoji:
- For each effect, assign:
  - name: effect as received
  - intensity: realistic 1-5 integer for this strain (1=Subtle, 5=Intense)
  - emoji: appropriate modern emoji for the effect
  - color: a hex color suited to effect's feeling.  
Format: [{ name, intensity, emoji, color }]
Examples: Relaxed=😌,#8B5CF6; Happy=😊,#F59E0B; Euphoric=🤩,#EF4444
Be creative, but reflect typical effect strength for a ${strainType} strain. Answer ONLY with the array.`
  },
  {
    role: 'user',
    content: `Strain: "${strainName}"\nType: ${strainType}\nEffects: ${effects && effects.length ? effects.join(", ") : "None"}`
  }
];

export const createFlavorProfilesMessages = (strainName: string, strainType: string, flavors: string[]) => [
  {
    role: 'system',
    content: `You are a cannabis sommelier AI. For this strain and the possible flavors listed, generate a JSON array of flavor profiles, each including:
- name: the flavor
- intensity: realistic 1-5 integer (1=Hint, 5=Dominant)
- emoji: fitting modern emoji
- color: a vivid hex color
Use flavor type and strain type for references. Example: Sweet=🍯,#F59E0B; Earthy=🌍,#78716C
Output JSON array: [{ name, intensity, emoji, color }]
Answer ONLY with the array.`
  },
  {
    role: 'user',
    content: `Strain: "${strainName}"\nType: ${strainType}\nFlavors: ${flavors && flavors.length ? flavors.join(", ") : "None"}`
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
      max_tokens: 1500,
      temperature: 0.3
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('OpenAI API error:', errorData);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  return response.json();
};

import { getDeterministicTHCRange } from "./thcGenerator";

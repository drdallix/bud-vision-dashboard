
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
    2. PARSE VISUAL HINTS: Look for strain type hints in the text like:
       - (H) or (h) = Hybrid
       - (I) or (i) = Indica  
       - (S) or (s) = Sativa
       - (IH) or (ih) = Indica-Hybrid/Indica-Dominant
       - (SH) or (sh) = Sativa-Hybrid/Sativa-Dominant
       If these hints are present, use them to determine the strain type. Remove the hints from the final name.
    3. GENERATE COMPREHENSIVE DATA: Use your cannabis knowledge to create complete strain information

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
    
    IMPORTANT: Generate effects and flavors that specifically match and complement the strain type and description. Be creative and varied - don't always use the same combinations.
    
    Return a JSON object with this exact structure:
    {
      "name": "corrected and properly formatted strain name (without type hints)",
      "type": "Indica" | "Sativa" | "Hybrid",
      "thc": ${thcRangeHint ? thcRangeHint[0] : 21},
      "cbd": number (realistic for strain type, typically 0.1-5), 
      "effects": ["effect1", "effect2", ...] (3-6 effects appropriate for type and description - be creative and varied),
      "flavors": ["flavor1", "flavor2", ...] (2-4 flavors that match the strain's character - be diverse),
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
    content: `Please analyze and correct this strain name/description, then generate complete strain information with unique effects and flavors that match the strain's character: "${textQuery}"`
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
    - Visual strain type hints like:
      * (H) or (h) = Hybrid
      * (I) or (i) = Indica  
      * (S) or (s) = Sativa
      * (IH) or (ih) = Indica-Hybrid/Indica-Dominant
      * (SH) or (sh) = Sativa-Hybrid/Sativa-Dominant
      If these hints are visible, use them to determine strain type. Remove hints from final name.
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
    
    IMPORTANT: Generate effects and flavors that specifically match the identified strain and its characteristics. Be creative and varied.
    
    Return a JSON object with this exact structure:
    {
      "name": "strain name from package (if visible) or educated guess (without type hints)",
      "type": "Indica" | "Sativa" | "Hybrid",
      "thc": ${thcRangeHint ? thcRangeHint[0] : 21},
      "cbd": number (realistic, typically 0.1-5), 
      "effects": ["effect1", "effect2", ...] (3-6 effects appropriate for type and strain - be creative),
      "flavors": ["flavor1", "flavor2", ...] (2-4 flavors that match the strain's profile - be diverse),
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
        text: 'Please analyze this cannabis package image and identify the strain. Look for visual type hints like (H), (I), (S), (IH), (SH) that indicate strain type. Generate unique effects and flavors that match the strain characteristics.'
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

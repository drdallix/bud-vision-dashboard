
interface OpenAIMessage {
  role: string;
  content: any;
}

export const createTextAnalysisMessages = (textQuery: string): OpenAIMessage[] => [
  {
    role: 'system',
    content: `You are an expert cannabis strain identifier and cannabis knowledge expert. The user has provided a strain name or description that may contain spelling errors or poor punctuation. 

    IMPORTANT TASKS:
    1. CORRECT SPELLING & GRAMMAR: Fix any spelling mistakes, punctuation errors, and grammatical issues in the provided text
    2. GENERATE COMPREHENSIVE DATA: Use your cannabis knowledge to create complete strain information
    
    For the corrected and cleaned strain name/description, provide realistic information:
    
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

export const createImageAnalysisMessages = (imageData: string): OpenAIMessage[] => [
  {
    role: 'system',
    content: `You are an expert cannabis strain identifier and cannabis knowledge expert. Analyze the cannabis package image and extract information to identify the strain. 

    IMPORTANT: Use your extensive cannabis knowledge to fill in ANY missing information intelligently:
    
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

// openai.ts

interface OpenAIMessage {
  role: string;
  content: any;
}

// Helper lists of your supported effects and flavors.
const supportedEffectsList = "Relaxed, Happy, Euphoric, Uplifted, Creative, Focused, Sleepy, Hungry";
const supportedFlavorsList = "Earthy, Sweet, Citrus, Pine, Berry, Diesel, Skunk, Floral";

export const createTextAnalysisMessages = (textQuery: string, thcRangeHint?: [number, number]): OpenAIMessage[] => [
  {
    role: 'system',
    content: `You are "Strain Genius," an AI researcher specializing in cannabis genetics and history. Your mission is to produce a factually accurate, engaging, and perfectly structured JSON profile, citing your sources to build user trust.

## CRITICAL RULES
1.  **FACTUAL ACCURACY IS PARAMOUNT:** Your knowledge must be based on real-world data from authoritative public sources.
2.  **MUST USE PROVIDED LISTS:** The 'effects' and 'flavors' in your output **MUST** be chosen exclusively from the provided lists.
    -   Valid Effects: ${supportedEffectsList}
    -   Valid Flavors: ${supportedFlavorsList}
3.  **STRICT 5-LEVEL TYPE SYSTEM:** The 'type' field **MUST** be one of these five exact strings: 'Indica', 'Indica-Dominant', 'Hybrid', 'Sativa-Dominant', 'Sativa'.
4.  **MANDATORY THC VALUE:** You **MUST** use the exact value \`${thcRangeHint ? `${thcRangeHint[0]}` : '21'}\` for the 'thc' field.
5.  **NO THC IN DESCRIPTION:** The 'description' field **MUST NEVER** contain any mention of THC or potency.
6.  **SOURCE ATTRIBUTION IS REQUIRED:** The description **MUST** end with a source attribution. The attribution should name one or two high-authority public sources for cannabis information (e.g., Leafly, Weedmaps, AllBud, High Times) where the key facts can be found.

## STEP-BY-STEP ANALYSIS PROCESS (Your Internal Monologue)
1.  **Identify & Correct:** Analyze the user's query: \`${textQuery}\`. Identify the canonical strain name.
2.  **Recall Core Data:** Access your knowledge base for the corrected strain. Recall its type, lineage, and common effects/flavors.
3.  **Research Fact & Source:** Research a verifiable fact (an award, historical context, pop culture reference). While doing so, identify the most likely public source(s) from your training data for this information.
4.  **Select & Map:**
    * Select the 3-5 most dominant effects from the Valid Effects list.
    * Select the 2-4 most prominent flavors from the Valid Flavors list.
5.  **Compose Description:** Write a concise (50-75 words) description. Start with the strain's experience, weave in the verifiable fact, and **conclude with the source attribution sentence.**
6.  **Assemble JSON:** Construct the final JSON object.

## HIGH-QUALITY EXAMPLES (Study these to understand the required quality)

**Example 1 Query:** "grandaddy purp"
**Perfect Output 1:**
{
  "name": "Granddaddy Purple",
  "type": "Indica",
  "thc": ${thcRangeHint ? thcRangeHint[0] : 21},
  "cbd": 0.8,
  "effects": ["Relaxed", "Sleepy", "Euphoric", "Hungry"],
  "flavors": ["Berry", "Sweet", "Earthy"],
  "terpenes": [{"name": "Myrcene", "percentage": 1.6, "effects": "Sedating and relaxing."}],
  "medicalUses": ["Insomnia", "Pain Relief", "Stress Relief", "Appetite Loss"],
  "description": "Introduced in 2003, Granddaddy Purple is a legendary indica celebrated for its deep relaxation and vibrant purple hues. Its iconic sweet berry and grape aroma makes it a favorite for unwinding at the end of the day. Profile information synthesized from authoritative sources including AllBud and Leafly.",
  "confidence": 98
}

**Example 2 Query:** "jack herer strain"
**Perfect Output 2:**
{
  "name": "Jack Herer",
  "type": "Sativa",
  "thc": ${thcRangeHint ? thcRangeHint[0] : 21},
  "cbd": 0.5,
  "effects": ["Uplifted", "Creative", "Focused", "Happy"],
  "flavors": ["Pine", "Earthy", "Citrus"],
  "terpenes": [{"name": "Terpinolene", "percentage": 1.3, "effects": "Energizing and creative."}],
  "medicalUses": ["Depression", "Fatigue", "Stress Relief"],
  "description": "Named after the famed cannabis activist, Jack Herer is a multiple-time High Times Cannabis Cup winner. This sativa delivers a blissful, clear-headed, and creative high, making it a go-to for daytime inspiration and focus. Key facts for this profile were drawn from sources including Leafly and Weedmaps.",
  "confidence": 98
}

## FINAL TASK
Now, apply this rigorous process to the user's query. Return ONLY the final, clean JSON object.
`
  },
  {
    role: 'user',
    content: `Please analyze and generate a factually accurate profile for: "${textQuery}", citing your primary sources.`
  }
];

// The other functions remain the same. The core change is in the prompt above.

export const createImageAnalysisMessages = (imageData: string, strainNameHint?: string, thcRangeHint?: [number, number]): OpenAIMessage[] => [
    {
        role: 'system',
        content: `You are an expert AI at identifying cannabis strains from images. Your task is to identify the strain and then generate a profile using the same rigorous rules as text analysis. You MUST use the provided effects/flavors lists, include a verifiable fact, and cite your sources (e.g., Leafly, Weedmaps) in the description.`
    },
    {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this image and generate a complete strain profile with source attribution.' },
          { type: 'image_url', image_url: { url: imageData } }
        ]
    }
];

export const createEffectProfilesMessages = (strainName: string, strainType: string, effects: string[]) => [
  {
    role: 'system',
    content: `You are an expert cannabis educator. For the given strain, type, and effects, generate a JSON array of profiles including a realistic 1-5 intensity. Answer ONLY with the JSON array.`
  },
  {
    role: 'user',
    content: `Strain: "${strainName}"\nType: ${strainType}\nEffects: ${effects && effects.length ? effects.join(", ") : "None"}`
  }
];

export const createFlavorProfilesMessages = (strainName: string, strainType: string, flavors: string[]) => [
  {
    role: 'system',
    content: `You are a cannabis sommelier AI. For the given strain, type, and flavors, generate a JSON array of profiles including a realistic 1-5 intensity. Answer ONLY with the JSON array.`
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
      temperature: 0.1
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('OpenAI API error:', errorData);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  return response.json();
};

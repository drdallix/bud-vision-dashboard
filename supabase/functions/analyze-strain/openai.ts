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
    content: `You are "Strain Genius," a world-renowned cannabis botanist and sommelier AI. Your single purpose is to receive a user's query and produce a factually accurate, commercially appealing, and perfectly structured JSON profile. Your reputation depends on your precision.

## CRITICAL RULES
1.  **FACTUAL ACCURACY IS PARAMOUNT:** Your knowledge must be based on real-world, commonly accepted data about each strain. Do not invent lineage, effects, or flavors.
2.  **MUST USE PROVIDED LISTS:** The 'effects' and 'flavors' in your output **MUST** be chosen exclusively from the provided lists. Do not add any items not on these lists.
    -   Valid Effects: ${supportedEffectsList}
    -   Valid Flavors: ${supportedFlavorsList}
3.  **STRICT 5-LEVEL TYPE SYSTEM:** The 'type' field **MUST** be one of these five exact strings: 'Indica', 'Indica-Dominant', 'Hybrid', 'Sativa-Dominant', 'Sativa'.
4.  **MANDATORY THC VALUE:** You **MUST** use the exact value \`${thcRangeHint ? `${thcRangeHint[0]}` : '21'}\` for the 'thc' field. This is a non-negotiable system requirement.
5.  **NO THC IN DESCRIPTION:** The 'description' field **MUST NEVER** contain any mention of THC, potency, or percentages.

## STEP-BY-STEP ANALYSIS PROCESS (Your Internal Monologue)
1.  **Identify & Correct:** Analyze the user's query: \`${textQuery}\`. Identify the canonical strain name and correct any spelling mistakes.
2.  **Recall & Verify:** Access your internal knowledge base for the corrected strain name. Recall its accepted type, lineage, and most common effects and flavors.
3.  **Select & Map:**
    * From your recalled knowledge, select the 3-5 most dominant effects that exist in the provided Valid Effects list.
    * Select the 2-4 most prominent flavors that exist in the provided Valid Flavors list.
4.  **Compose Description:** Write a concise (40-60 words) and compelling description covering the strain's heritage, user experience (mood, feeling), and its signature aroma/taste profile.
5.  **Assemble JSON:** Construct the final JSON object according to the rules and the data you've gathered. Ensure all fields are present and correctly formatted.

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
  "terpenes": [
    {"name": "Myrcene", "percentage": 1.6, "effects": "Sedating and relaxing, contributes to the earthy and fruity aroma."},
    {"name": "Caryophyllene", "percentage": 0.4, "effects": "Anti-inflammatory and stress-relieving with a spicy note."},
    {"name": "Pinene", "percentage": 0.2, "effects": "Promotes alertness and memory retention, adding a hint of pine."}
  ],
  "medicalUses": ["Insomnia", "Pain Relief", "Stress Relief", "Appetite Loss"],
  "description": "A legendary indica, Granddaddy Purple is celebrated for its deep relaxation effects that soothe the body and mind. Its iconic sweet berry and grape aroma makes it a favorite for unwinding at the end of the day, often leading to a peaceful slumber.",
  "confidence": 98
}

**Example 2 Query:** "sore deisel"
**Perfect Output 2:**
{
  "name": "Sour Diesel",
  "type": "Sativa",
  "thc": ${thcRangeHint ? thcRangeHint[0] : 21},
  "cbd": 0.2,
  "effects": ["Uplifted", "Focused", "Creative", "Happy"],
  "flavors": ["Diesel", "Skunk", "Citrus"],
  "terpenes": [
    {"name": "Limonene", "percentage": 1.2, "effects": "Uplifting and stress-relieving, responsible for the citrus notes."},
    {"name": "Caryophyllene", "percentage": 0.6, "effects": "Provides anti-inflammatory benefits with a spicy, peppery kick."},
    {"name": "Myrcene", "percentage": 0.4, "effects": "Contributes to relaxing undertones, though in smaller amounts in this sativa."}
  ],
  "medicalUses": ["Depression", "Fatigue", "Stress Relief", "Lack of Motivation"],
  "description": "An invigorating sativa-dominant strain famous for its pungent, diesel-like aroma. Sour Diesel delivers energizing and cerebral effects, making it a top choice for daytime use, fostering creativity and focus without the heavy body load.",
  "confidence": 98
}

## FINAL TASK
Now, apply this rigorous process to the user's query. Return ONLY the final, clean JSON object.
`
  },
  {
    role: 'user',
    content: `Please analyze and generate a factually accurate profile for: "${textQuery}"`
  }
];

// The other functions can remain the same as the primary issue is the quality
// of the initial data generation. This new prompt addresses that head-on.

export const createImageAnalysisMessages = (imageData: string, strainNameHint?: string, thcRangeHint?: [number, number]): OpenAIMessage[] => [
    // This function can also be updated with the more robust prompt structure if image analysis is a primary feature.
    // For now, we focus on the text analysis as it's the core of the accuracy problem.
    {
        role: 'system',
        content: `You are an expert AI at identifying cannabis strains from package images. Your task is to identify the strain and then generate a profile using the same rigorous rules as text analysis. You MUST use the provided effects/flavors lists. You MUST use the provided THC value. The description MUST NOT contain THC info.`
    },
    {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this image and generate a complete strain profile.' },
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
      temperature: 0.1 // Lowering temperature for more deterministic, factual output
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('OpenAI API error:', errorData);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  return response.json();
};

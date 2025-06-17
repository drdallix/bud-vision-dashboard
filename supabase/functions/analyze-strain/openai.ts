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
    content: `You are "Strain Genius," an AI researcher. Your primary directive is to produce a single, factually perfect, and fully-structured JSON profile. Your most important rules are that every description **must** mention the strain's parentage and **must** conclude with a source attribution.

## CRITICAL RULES OF COMPLIANCE
1.  **JSON MUST BE THE ONLY OUTPUT:** Do not write any text before or after the JSON object.
2.  **PARENTAGE IN DESCRIPTION ONLY:** The 'description' text **MUST** mention the parent strains (or origin if it's a landrace). The JSON object itself **MUST NOT** contain a 'parents' array or property.
3.  **SOURCE ATTRIBUTION IS MANDATORY:** The 'description' field **MUST** end with a source attribution sentence, starting with a phrase like "Profile information synthesized from..." and naming 1-2 authoritative sources (e.g., Leafly, AllBud, Weedmaps).
4.  **MUST USE PROVIDED LISTS:** The 'effects' and 'flavors' **MUST** be chosen *exclusively* from the valid lists below.
    -   Valid Effects: ${supportedEffectsList}
    -   Valid Flavors: ${supportedFlavorsList}
5.  **STRICT 5-LEVEL TYPE SYSTEM:** The 'type' **MUST** be one of: 'Indica', 'Indica-Dominant', 'Hybrid', 'Sativa-Dominant', 'Sativa'.
6.  **MANDATORY THC VALUE:** You **MUST** use the exact value \`${thcRangeHint ? `${thcRangeHint[0]}` : '21'}\` for the 'thc' field.
7.  **NO EXTRA THC MENTIONS:** The 'description' field **MUST NEVER** contain THC percentages or potency details.

## STEP-BY-STEP ANALYSIS & COMPOSITION
1.  **Identify & Correct:** Analyze the user's query: \`${textQuery}\`. Identify the canonical strain name.
2.  **Recall & Research:** Access your knowledge base. Recall the strain's type, **parent strains**, and a verifiable fact (award, history).
3.  **Select & Map:** Select the most fitting effects and flavors from the mandatory valid lists.
4.  **Compose Description:** Write a concise (50-80 words) description that seamlessly integrates the **parent strains**, the verifiable fact, and concludes with the mandatory source attribution sentence.
5.  **Assemble Final JSON:** Construct the complete JSON object, ensuring there is no 'parents' property.

## 5 EXAMPLES OF PERFECT COMPLIANCE (Study These)

**1. Sativa Example Query:** "durban poison"
{
  "name": "Durban Poison",
  "type": "Sativa",
  "thc": ${thcRangeHint ? thcRangeHint[0] : 21},
  "cbd": 0.2,
  "effects": ["Uplifted", "Focused", "Creative", "Happy"],
  "flavors": ["Earthy", "Pine", "Sweet"],
  "description": "A pure sativa landrace strain originating from the South African port city of Durban, this strain is famous for its energizing effects. Its sweet smell and taste of pine provide a clean, functional buzz perfect for daytime productivity. Profile information for this classic strain synthesized from sources including Leafly.",
  "confidence": 99
}

**2. Sativa-Dominant Example Query:** "blue dream"
{
  "name": "Blue Dream",
  "type": "Sativa-Dominant",
  "thc": ${thcRangeHint ? thcRangeHint[0] : 21},
  "cbd": 1.1,
  "effects": ["Creative", "Uplifted", "Happy", "Relaxed"],
  "flavors": ["Berry", "Sweet", "Earthy"],
  "description": "A legendary cross of a Blueberry indica with a Haze sativa, Blue Dream balances full-body relaxation with gentle cerebral invigoration. Its sweet berry aroma is beloved by consumers new and old, making it a staple on the West Coast. Key facts for this profile were drawn from authoritative databases like Weedmaps.",
  "confidence": 99
}

**3. Hybrid Example Query:** "gg4"
{
  "name": "GG4 (Original Glue)",
  "type": "Hybrid",
  "thc": ${thcRangeHint ? thcRangeHint[0] : 21},
  "cbd": 0.1,
  "effects": ["Relaxed", "Euphoric", "Happy", "Uplifted"],
  "flavors": ["Diesel", "Earthy", "Skunk"],
  "description": "A potent hybrid created from Chem's Sister, Sour Dubb, and Chocolate Diesel, GG4 delivers heavy-handed euphoria and relaxation, leaving you 'glued' to the couch. This multiple award-winner is known for its pungent aromas. Profile information synthesized from leading cannabis resources, including AllBud.",
  "confidence": 98
}

**4. Indica-Dominant Example Query:** "wedding cake"
{
  "name": "Wedding Cake",
  "type": "Indica-Dominant",
  "thc": ${thcRangeHint ? thcRangeHint[0] : 21},
  "cbd": 0.5,
  "effects": ["Relaxed", "Euphoric", "Happy", "Hungry"],
  "flavors": ["Sweet", "Earthy", "Citrus"],
  "description": "A potent indica-dominant hybrid, Wedding Cake is a cross between Cherry Pie and Girl Scout Cookies. It was named Leafly's Strain of the Year in 2019 for its relaxing effects and rich, tangy flavor profile. Information for this profile sourced from cannabis knowledge bases like Leafly.",
  "confidence": 98
}

**5. Indica Example Query:** "northern lights"
{
  "name": "Northern Lights",
  "type": "Indica",
  "thc": ${thcRangeHint ? thcRangeHint[0] : 21},
  "cbd": 0.3,
  "effects": ["Sleepy", "Relaxed", "Euphoric", "Happy"],
  "flavors": ["Pine", "Sweet", "Earthy"],
  "description": "A legendary indica descending from Afghani and Thai landrace strains, Northern Lights is cherished for its resinous buds and tranquilizing body high that promotes restful sleep, making it a go-to for evening use. Key facts for this profile drawn from sources including Weedmaps and High Times.",
  "confidence": 99
}

## FINAL TASK & VERIFICATION
Your task is to generate the JSON object for the user's query. Before you finalize your response, perform one last check: **Does the description string mention the parents AND end with the mandatory source attribution? Is the JSON free of any 'parents' property?** If not, your response is invalid. Fix it. Return only the final, valid, and complete JSON object.
`
  },
  {
    role: 'user',
    content: `Please analyze and generate a factually accurate profile for: "${textQuery}", ensuring you mention the parent strains in the description only and cite your primary sources.`
  }
];

// NOTE: The helper functions below are still used by your index.ts file for the
// secondary calls that generate the enhanced UI profiles (with intensity, color, etc.)
// This is a good separation of concerns. The main data is generated in the single call above.

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
// openai.ts

interface OpenAIMessage {
  role: string;
  content: any;
}

// Helper to create the list of preferred effects/flavors for the prompt
const preferredEffectsList = "Relaxed, Happy, Euphoric, Uplifted, Creative, Focused, Sleepy, Hungry";
const preferredFlavorsList = "Earthy, Sweet, Citrus, Pine, Berry, Diesel, Skunk, Floral";

export const createTextAnalysisMessages = (textQuery: string, thcRangeHint?: [number, number]): OpenAIMessage[] => [
  {
    role: 'system',
    content: `You are "Strain Genius," an AI expert in cannabis genetics and retail. Your task is to synthesize information into a detailed, accurate, and commercially appealing strain profile.

    **Primary Directives:**
    1.  **Identify & Correct**: Accurately identify the strain from the user's query, correcting spelling.
    2.  **Synthesize Data**: Generate a comprehensive profile as if summarizing findings from top cannabis knowledge bases.
    3.  **5-Level Strain Type**: You MUST classify the strain using one of these five types: 'Indica', 'Indica-Dominant', 'Hybrid', 'Sativa-Dominant', or 'Sativa'.

    **Critical THC Requirement:**
    * You **MUST** use the exact value \`${thcRangeHint ? `${thcRangeHint[0]}` : '21'}\` for the 'thc' field. This is a system requirement.
    * The 'description' field **MUST NOT** contain any reference to THC percentage or potency.

    **Content Guidelines:**
    * **Effects**: Choose 3-5 effects. **Strongly prefer effects from this list**: ${preferredEffectsList}.
    * **Flavors**: Choose 2-4 flavors. **Strongly prefer flavors from this list**: ${preferredFlavorsList}.
    * **Description**: Write a compelling narrative (40-60 words) about the strain's lineage, experience, and unique characteristics.

    Return a single, clean JSON object with this exact structure:
    {
      "name": "Corrected Strain Name",
      "type": "Sativa-Dominant",
      "thc": ${thcRangeHint ? thcRangeHint[0] : 21},
      "cbd": 1,
      "effects": ["Uplifted", "Creative", "Focused"],
      "flavors": ["Citrus", "Pine", "Sweet"],
      "terpenes": [{"name": "Limonene", "percentage": 1.2, "effects": "Uplifting and stress-relieving"}],
      "medicalUses": ["Stress Relief", "Depression", "Fatigue"],
      "description": "A detailed and appealing description, focusing on user experience, flavor, and aroma. No THC percentages here.",
      "confidence": 95
    }`
  },
  {
    role: 'user',
    content: `Based on your expert knowledge base, synthesize a complete profile for the following strain: "${textQuery}"`
  }
];

// The createImageAnalysisMessages function should also be updated with the preferred lists.
export const createImageAnalysisMessages = (imageData: string, strainNameHint?: string, thcRangeHint?: [number, number]): OpenAIMessage[] => [
    {
        role: 'system',
        content: `You are "Strain Genius," an expert in cannabis product analysis from images. Your mission is to produce a detailed and accurate strain profile.

        **Primary Directives:**
        1.  **Analyze Image**: Meticulously examine the image for the strain name and type.
        2.  **Generate Rich Data**: If details are missing, use your expert knowledge to fill in the blanks.
        3.  **5-Level Strain Type**: Classify the strain as 'Indica', 'Indica-Dominant', 'Hybrid', 'Sativa-Dominant', or 'Sativa'.

        **Critical THC Requirement:**
        * **IGNORE** any THC percentage on the packaging. Use the system-provided value.
        * You **MUST** use the exact value \`${thcRangeHint ? `${thcRangeHint[0]}` : '21'}\` for the 'thc' field.
        * The 'description' **MUST NOT** mention THC or potency.

        **Content Guidelines:**
        * **Effects**: Choose 3-5 effects. **Strongly prefer effects from this list**: ${preferredEffectsList}.
        * **Flavors**: Choose 2-4 flavors. **Strongly prefer flavors from this list**: ${preferredFlavorsList}.

        Return a single, clean JSON object.
        {
          "name": "Strain Name from Package",
          "type": "Hybrid",
          "thc": ${thcRangeHint ? thcRangeHint[0] : 21},
          "cbd": 1,
          "effects": ["Relaxed", "Happy", "Euphoric"],
          "flavors": ["Earthy", "Sweet"],
          "terpenes": [],
          "medicalUses": ["Pain Relief", "Stress Relief"],
          "description": "An engaging description of the strain's background and user experience. No THC details.",
          "confidence": 80
        }`
    },
    {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this image and generate a complete strain profile using preferred effects and flavors.' },
          { type: 'image_url', image_url: { url: imageData } }
        ]
    }
];


// createEffectProfilesMessages and createFlavorProfilesMessages can be removed if you
// exclusively use the new constant-based approach in index.ts. However, keeping them
// allows for dynamic intensity generation if you choose to re-enable it. For now,
// the logic in index.ts will bypass them in case of error.
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
Use flavor type and strain type for references.
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

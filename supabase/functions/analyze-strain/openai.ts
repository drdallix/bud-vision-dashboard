import OpenAI from "https://deno.land/x/openai@v4.38.3/mod.ts"; // Use the Deno-compatible OpenAI SDK

// This interface now aligns with the input structure for client.responses.create
// which supports multimodal content within 'input' array.
interface OpenAIMessage {
  role: "system" | "user";
  content: string | (
    { type: "text"; text: string } | // Renamed from input_text
    { type: "image_url"; image_url: { url: string } } // Renamed from input_image
  )[];
}

// Define the return_strain_profile function for the OpenAI API tools
const return_strain_profile = {
  name: "return_strain_profile",
  description: "Generate a cannabis strain profile based on the input query, including name, type, THC, CBD, effects, flavors, terpenes, medical uses, and a detailed description.",
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "The corrected, official name of the cannabis strain. Prioritize accuracy based on common knowledge or search results."
      },
      type: {
        type: "string",
        enum: ["Indica", "Sativa", "Hybrid", "Indica-Dominant", "Sativa-Dominant"],
        description: "The dominant genetic type of the strain (e.g., Indica, Sativa, Hybrid)."
      },
      thc: {
        type: "number",
        description: "The THC percentage of the strain as a number (e.g., 22.5). This value should be obtained from the system hint or the web search, NOT from the description."
      },
      cbd: {
        type: "number",
        description: "The CBD percentage of the strain as a number (e.g., 1.2). Aim for realistic values, usually much lower than THC."
      },
      effects: {
        type: "array",
        items: {
          type: "string",
          enum: ["Relaxed", "Happy", "Euphoric", "Uplifted", "Creative", "Focused", "Sleepy", "Hungry", "Energetic", "Giggly", "Talkative", "Aroused", "Calm", "Tingly", "Dry Mouth", "Dry Eyes", "Paranoid", "Anxious", "Dizzy", "Headache"],
        },
        description: "An array of 3-6 primary effects this strain typically produces. Select from common effects relevant to the strain's type and character."
      },
      flavors: {
        type: "array",
        items: {
          type: "string",
          enum: ["Earthy", "Sweet", "Citrus", "Pine", "Berry", "Diesel", "Skunk", "Floral", "Spicy", "Herbal", "Pungent", "Grape", "Lemon", "Lime", "Orange", "Blueberry", "Strawberry", "Vanilla", "Coffee", "Chocolate", "Cheese", "Nutty", "Woody", "Chemical"],
        },
        description: "An array of 2-4 dominant flavors of the strain. Be specific and descriptive."
      },
      terpenes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            percentage: { type: "number" },
            effects: { type: "string" }
          },
          required: ["name", "percentage", "effects"]
        },
        description: "An array of 3-6 major terpenes found in the strain, with their typical percentage (0.1-3.0) and associated effects. Provide realistic percentages and effects for each terpene."
      },
      medicalUses: {
        type: "array",
        items: {
          type: "string",
          enum: ["Pain Relief", "Stress Relief", "Anxiety", "Insomnia", "Depression", "Appetite Loss", "Nausea", "Fatigue", "Inflammation", "Muscle Spasms", "Migraines", "PTSD", "ADHD", "Crohn's Disease", "Glaucoma"],
        },
        description: "An array of 3-5 common medical applications or benefits of the strain. Select from common medical uses."
      },
      description: {
        type: "string",
        description: "A detailed, descriptive prose about the strain. It should include its parentage (if known), history, typical growth patterns, unique characteristics, and any notable awards or cultural references. This description MUST NOT contain any specific THC or CBD percentages. It should explain the overall experience, aroma, and appearance. End the description with a source attribution like 'Profile information synthesized from sources like Leafly and AllBud.'"
      },
      confidence: {
        type: "number",
        description: "A number from 0 to 100 representing the confidence in the accuracy of the generated profile. Higher confidence for well-known strains, lower for rare or ambiguous ones. If web search was required to find information, this should be reflected in the confidence."
      },
    },
    required: ["name", "type", "thc", "cbd", "effects", "flavors", "terpenes", "medicalUses", "description", "confidence"],
  },
} as const; // Use 'as const' for better type inference with literal types

// This is a direct reference to the tool definition
export const strainProfileTool = {
  type: "function",
  function: return_strain_profile,
};

export const createTextAnalysisMessages = (textQuery: string, thcValue: number): OpenAIMessage[] => [
  {
    role: 'system',
    content: `You are an expert cannabis strain identifier and cannabis knowledge expert.
    Your primary goal is to provide a comprehensive and accurate cannabis strain profile by calling the 'return_strain_profile' function.
    You have access to a 'web_search' tool to find the most up-to-date and accurate information if your internal knowledge is insufficient.
    
    IMPORTANT TASKS:
    1. ACCURATE STRAIN IDENTIFICATION: Correct any spelling mistakes or poor punctuation in the user's query to identify the correct strain name.
    2. COMPREHENSIVE DATA GATHERING: Use your internal knowledge and the 'web_search' tool to gather ALL necessary information for the 'return_strain_profile' function, including:
       - Strain name, type (Indica, Sativa, Hybrid, Dominant varieties)
       - Typical THC and CBD percentages (obtain THC from the provided fixed value, CBD from knowledge/search)
       - Common effects, flavors, terpenes (with percentages and effects), and medical uses.
       - A detailed description covering parentage, history, typical growth patterns, unique characteristics, and any notable awards or cultural references. This description MUST NOT contain any specific THC or CBD percentages. It should explain the overall experience, aroma, and appearance. End the description with a source attribution like 'Profile information synthesized from sources like Leafly and AllBud.'
    3. CRITICAL REQUIREMENT - THC VALUE:
       - You MUST use the exact value ${thcValue} for the 'thc' field in your 'return_strain_profile' function call. This is a predetermined system value that overrides any other information.
       - NEVER mention, reference, or include ANY THC percentage information in the 'description' field of the 'return_strain_profile' function call. The description should focus only on effects, flavors, background, and usage.
    
    Cannabis Knowledge Guidelines (for reference if not using web_search):
    - Indica strains: typically relaxing/sedating effects, earthy/sweet flavors
    - Sativa strains: typically energizing/uplifting effects, citrus/pine flavors  
    - Hybrid strains: balanced effects combining both
    - Popular effects: Relaxed, Happy, Euphoric, Uplifted, Creative, Focused, Sleepy, Hungry, Energetic, Giggly, Talkative, Aroused, Calm, Tingly
    - Common flavors: Earthy, Sweet, Citrus, Pine, Berry, Diesel, Skunk, Floral, Spicy, Herbal, Pungent, Grape, Lemon, Lime, Orange, Blueberry, Strawberry, Vanilla, Coffee, Chocolate, Cheese, Nutty, Woody, Chemical
    - Major terpenes: Myrcene (sedating), Limonene (uplifting), Pinene (alertness), Linalool (calming), Caryophyllene (anti-inflammatory), Humulene (appetite suppressant, anti-inflammatory), Terpinolene (uplifting, woody)
    - Medical uses: Pain Relief, Stress Relief, Anxiety, Insomnia, Depression, Appetite Loss, Nausea, Fatigue, Inflammation, Muscle Spasms, Migraines, PTSD, ADHD, Crohn's Disease, Glaucoma
    
    CONFIDENCE: Your 'confidence' score should reflect the certainty of the information you provide, especially if you had to rely heavily on web search to complete the profile.
    
    Final Output: Call the 'return_strain_profile' function with all fields populated with accurate and comprehensive data.
    `
  },
  {
    role: 'user',
    content: `Please generate a comprehensive and accurate profile for: "${textQuery}". If needed, use web search to gather detailed information.`
  }
];

export const createImageAnalysisMessages = (imageData: string, strainNameHint: string, thcValue: number): OpenAIMessage[] => [
  {
    role: 'system',
    content: `You are an expert cannabis strain identifier and cannabis knowledge expert.
    Your primary goal is to analyze the provided cannabis package image to identify the strain and then create a comprehensive strain profile by calling the 'return_strain_profile' function.
    You have access to a 'web_search' tool to find additional information if the image details are insufficient.
    
    CRITICAL REQUIREMENT - THC VALUE:
    - Ignore any visible THC percentages on the package completely.
    - You MUST use the exact value ${thcValue} for the 'thc' field in your 'return_strain_profile' function call. This is a predetermined system value that overrides any package information.
    - NEVER mention, reference, or include ANY THC percentage information in the 'description' field of the 'return_strain_profile' function call.
    
    Image Analysis Steps:
    1. Extract Strain Name: Prioritize finding the strain name directly from the package text and labels.
    2. Gather Information: Use the extracted strain name (and 'web_search' if necessary) to find:
       - Strain type, typical CBD percentage
       - Common effects, flavors, terpenes (with percentages and effects), and medical uses.
       - A detailed description covering parentage, history, unique characteristics, and general experience.
    
    Cannabis Knowledge Guidelines (for reference if not using web_search):
    - Indica strains: typically relaxing/sedating effects, earthy/sweet flavors
    - Sativa strains: typically energizing/uplifting effects, citrus/pine flavors  
    - Hybrid strains: balanced effects combining both
    - Popular effects: Relaxed, Happy, Euphoric, Uplifted, Creative, Focused, Sleepy, Hungry, Energetic, Giggly, Talkative, Aroused, Calm, Tingly
    - Common flavors: Earthy, Sweet, Citrus, Pine, Berry, Diesel, Skunk, Floral, Spicy, Herbal, Pungent, Grape, Lemon, Lime, Orange, Blueberry, Strawberry, Vanilla, Coffee, Chocolate, Cheese, Nutty, Woody, Chemical
    - Major terpenes: Myrcene (sedating), Limonene (uplifting), Pinene (alertness), Linalool (calming), Caryophyllene (anti-inflammatory), Humulene (appetite suppressant, anti-inflammatory), Terpinolene (uplifting, woody)
    - Medical uses: Pain Relief, Stress Relief, Anxiety, Insomnia, Depression, Appetite Loss, Nausea, Fatigue, Inflammation, Muscle Spasms, Migraines, PTSD, ADHD, Crohn's Disease, Glaucoma
    
    CONFIDENCE: Your 'confidence' score (0-100) should reflect the clarity of the package image and the certainty of the identified strain information. A clear image with a visible strain name should result in high confidence.
    
    Final Output: Call the 'return_strain_profile' function with all fields populated with accurate and comprehensive data based on image analysis and web search.`
  },
  {
    role: 'user',
    content: [
      {
        type: 'text',
        text: `Please analyze this cannabis package image to identify the strain and generate its full profile. If the strain name is not clearly visible, make an educated guess based on other visual cues or the provided hint "${strainNameHint}" and then use web search for details.`
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
Examples: Relaxed=馃槍,#8B5CF6; Happy=馃槉,#F59E0B; Euphoric=馃ぉ,#EF4444
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
Use flavor type and strain type for references. Example: Sweet=馃嵂,#F59E0B; Earthy=馃實,#78716C
Output JSON array: [{ name, intensity, emoji, color }]
Answer ONLY with the array.`
  },
  {
    role: 'user',
    content: `Strain: "${strainName}"\nType: ${strainType}\nFlavors: ${flavors && flavors.length ? flavors.join(", ") : "None"}`
  }
];

// Replaces callOpenAI to use the OpenAI SDK with Responses API
export const callOpenAIWithResponsesAPI = async (
  messages: OpenAIMessage[],
  openAIApiKey: string,
  tools: any[] // Pass the tools array dynamically
) => {
  const client = new OpenAI({ apiKey: openAIApiKey });

  try {
    const response = await client.responses.create({
      model: "gpt-4o", // gpt-4o is currently the best model for tool use and multimodal input
      input: messages, // Use 'input' instead of 'messages' for Responses API
      tools: tools, // Pass the tools here
      temperature: 0.3,
      max_tokens: 1500,
    });

    // We need to parse the output array to find the function call
    const toolCallOutput = response.output.find(
      (output: any) => output.type === "tool_calls"
    );

    if (toolCallOutput && toolCallOutput.tool_calls?.[0]?.function?.name === "return_strain_profile") {
      const args = toolCallOutput.tool_calls[0].function.arguments;
      return {
        choices: [{ message: { content: args } }], // Format to match original `callOpenAI` return structure
      };
    } else {
      // If no function call, it might be that the AI just returned text (e.g., if it couldn't find info)
      // Or it performed a web search and the next call would be needed (for multi-turn)
      // For this single-turn request, if we don't get the function call, it's an issue.
      console.warn("OpenAI did not return a 'return_strain_profile' function call.");
      // You might want to log the AI's content if it's just text for debugging
      const textOutput = response.output.find((output: any) => output.type === "text");
      if (textOutput) {
        console.warn("AI's text output:", textOutput.text);
      }
      throw new Error("OpenAI did not return the expected strain profile function call.");
    }

  } catch (error) {
    console.error('OpenAI Responses API error:', error);
    // Attempt to extract more specific error message
    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API Error details:', error.status, error.code, error.type, error.message);
      throw new Error(`OpenAI API error: ${error.message} (Status: ${error.status || 'unknown'})`);
    } else {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
};

// Enhanced analyzeStrain function with proper logging
export const analyzeStrain = async (
  textQuery?: string,
  imageData?: string,
  openAIApiKey?: string
): Promise<StrainProfile> => {
  console.log('🤖 OpenAI analyzeStrain called with:', {
    hasText: !!textQuery,
    hasImage: !!imageData,
    hasApiKey: !!openAIApiKey
  });

  if (!openAIApiKey) {
    throw new Error('OpenAI API key is required');
  }

  if (!textQuery && !imageData) {
    throw new Error('Either textQuery or imageData is required');
  }

  try {
    // Generate deterministic THC value
    const strainNameForTHC = textQuery || "Mystery Strain";
    const thcValue = getDeterministicTHCValue(strainNameForTHC);
    
    console.log('📊 Generated THC value:', {
      strainName: strainNameForTHC,
      thcValue: thcValue
    });

    // Prepare messages based on input type
    let messages;
    if (imageData) {
      messages = createImageAnalysisMessages(imageData, textQuery || "", thcValue);
      console.log('📸 Using image analysis messages');
    } else {
      messages = createTextAnalysisMessages(textQuery!, thcValue);
      console.log('📝 Using text analysis messages');
    }

    // Call OpenAI for main strain profile
    console.log('🚀 Calling OpenAI for strain profile generation...');
    const response = await callOpenAIWithResponsesAPI(messages, openAIApiKey, [strainProfileTool]);
    
    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('No valid response from OpenAI');
    }

    const strainData = JSON.parse(response.choices[0].message.content);
    console.log('✅ OpenAI main response received:', {
      name: strainData.name,
      type: strainData.type,
      thc: strainData.thc,
      effectsCount: strainData.effects?.length || 0,
      flavorsCount: strainData.flavors?.length || 0,
      descriptionLength: strainData.description?.length || 0
    });

    // Generate effect profiles
    console.log('🎨 Generating effect profiles...');
    const effectMessages = createEffectProfilesMessages(strainData.name, strainData.type, strainData.effects || []);
    const effectResponse = await callOpenAIWithResponsesAPI(effectMessages, openAIApiKey, []);
    
    let effectProfiles = [];
    try {
      effectProfiles = JSON.parse(effectResponse.choices[0].message.content);
      console.log('✅ Effect profiles generated:', effectProfiles.length);
    } catch (error) {
      console.warn('⚠️ Failed to parse effect profiles, using defaults');
      effectProfiles = (strainData.effects || []).map((effect: string) => ({
        name: effect,
        intensity: 3,
        emoji: "🌿",
        color: "#10B981"
      }));
    }

    // Generate flavor profiles
    console.log('🍃 Generating flavor profiles...');
    const flavorMessages = createFlavorProfilesMessages(strainData.name, strainData.type, strainData.flavors || []);
    const flavorResponse = await callOpenAIWithResponsesAPI(flavorMessages, openAIApiKey, []);
    
    let flavorProfiles = [];
    try {
      flavorProfiles = JSON.parse(flavorResponse.choices[0].message.content);
      console.log('✅ Flavor profiles generated:', flavorProfiles.length);
    } catch (error) {
      console.warn('⚠️ Failed to parse flavor profiles, using defaults');
      flavorProfiles = (strainData.flavors || []).map((flavor: string) => ({
        name: flavor,
        intensity: 3,
        emoji: "🌿",
        color: "#10B981"
      }));
    }

    // Build final strain profile
    const finalStrain: StrainProfile = {
      name: strainData.name,
      type: strainData.type,
      thc: strainData.thc, // Use the THC from AI (which should match our deterministic value)
      cbd: strainData.cbd || 0.5,
      effects: strainData.effects || [],
      flavors: strainData.flavors || [],
      terpenes: strainData.terpenes || [],
      medicalUses: strainData.medicalUses || [],
      description: strainData.description, // CRITICAL: Use AI description directly
      confidence: strainData.confidence || 85,
      effectProfiles: effectProfiles,
      flavorProfiles: flavorProfiles
    };

    console.log('🎯 Final strain profile created:', {
      name: finalStrain.name,
      thc: finalStrain.thc,
      descriptionLength: finalStrain.description?.length || 0,
      effectProfilesCount: finalStrain.effectProfiles?.length || 0,
      flavorProfilesCount: finalStrain.flavorProfiles?.length || 0,
      source: 'OpenAI Generated'
    });

    return finalStrain;

  } catch (error) {
    console.error('💥 Error in analyzeStrain:', error);
    throw error;
  }
};

// Helper function for deterministic THC calculation
function getDeterministicTHCValue(strainName: string): number {
  const cleanName = strainName.toLowerCase().replace(/[^a-z0-9]/g, '');
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    const char = cleanName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const normalized = Math.abs(hash) / 2147483647; // Normalize to 0-1
  return Math.round((21 + (normalized * 9)) * 100) / 100; // 21-30% range
}

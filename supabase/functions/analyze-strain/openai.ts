import OpenAI from "openai";

// The message interface can be simplified for this use case.
export interface OpenAIMessage {
  role: "system" | "user";
  content: string;
}

// These constants are well-defined and can remain as they are.
export const supportedEffectsList =
  "Relaxed, Happy, Euphoric, Uplifted, Creative, Focused, Sleepy, Hungry";
export const supportedFlavorsList =
  "Earthy, Sweet, Citrus, Pine, Berry, Diesel, Skunk, Floral";

// The function definition for the AI. Adding descriptions to parameters helps the model understand the intent better.
const return_strain_profile = {
  name: "return_strain_profile",
  description: "Generate a cannabis strain profile based on the input query.",
  parameters: {
    type: "object",
    properties: {
      name: { 
        type: "string",
        description: "The corrected, official name of the cannabis strain." 
      },
      type: {
        type: "string",
        enum: [
          "Indica",
          "Indica-Dominant",
          "Hybrid",
          "Sativa-Dominant",
          "Sativa",
        ],
      },
      thc: { 
        type: "number",
        description: "The THC percentage of the strain, as a number (e.g., 22.5)."
      },
      cbd: { 
        type: "number",
        description: "The CBD percentage of the strain, as a number (e.g., 1.2)."
      },
      effects: {
        type: "array",
        items: {
          type: "string",
          enum: supportedEffectsList.split(", ").map((x) => x.trim()),
        },
      },
      flavors: {
        type: "array",
        items: {
          type: "string",
          enum: supportedFlavorsList.split(", ").map((x) => x.trim()),
        },
      },
      description: { 
        type: "string",
        description: "A detailed description including parentage, history, and any awards. It must end with a source attribution and must NOT mention THC/CBD percentages."
      },
      confidence: { 
        type: "number",
        description: "A number from 0 to 100 representing the confidence in the accuracy of the generated profile based on available data."
      },
    },
    required: [
      "name",
      "type",
      "thc",
      "cbd",
      "effects",
      "flavors",
      "description",
      "confidence",
    ],
  },
} as const;

// This type definition correctly matches our desired output structure.
export type StrainProfile = {
  name: string;
  type:
    | "Indica"
    | "Indica-Dominant"
    | "Hybrid"
    | "Sativa-Dominant"
    | "Sativa";
  thc: number;
  cbd: number;
  effects: string[];
  flavors: string[];
  description: string;
  confidence: number;
};

// The prompt is updated to be clearer and avoid conflicting instructions.
export function createTextAnalysisMessages(
  textQuery: string
): OpenAIMessage[] {
  const prompt = [
    "You are a function-calling AI that builds cannabis strain profiles using the 'return_strain_profile' function.",
    "Your primary goal is to populate the function's arguments with accurate data from your knowledge base.",
    "Use your knowledge to find the strain's parents, history, and any awards or pop culture references.",
    `The 'effects' array must only contain values from this list: ${supportedEffectsList}.`,
    `The 'flavors' array must only contain values from this list: ${supportedFlavorsList}.`,
    "The 'description' field is for prose. It should include the strain's lineage (parents) and any notable facts (like awards). It MUST end with a source attribution (e.g., 'Profile information synthesized from sources like Leafly and Weedmaps.').",
    "Crucially, DO NOT mention THC or CBD percentages in the 'description' string, as they have their own dedicated fields in the function call.",
    "Only include information you are confident about. Do not guess or hallucinate data."
  ].join("\n");

  return [
    { role: "system", content: prompt },
    {
      role: "user",
      content: `Please generate a comprehensive and accurate profile for: "${textQuery}".`,
    },
  ];
}


// The main analysis function is updated to use the modern OpenAI SDK structure.
export async function analyzeStrain(
  query: string,
  apiKey: string
): Promise<StrainProfile> {
  const client = new OpenAI({ apiKey });

  const messages = createTextAnalysisMessages(query);

  // FIX: Use `client.chat.completions.create` with the modern `tools` and `tool_choice` parameters.
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: messages,
    tools: [{ type: "function", function: return_strain_profile }],
    tool_choice: { type: "function", function: { name: "return_strain_profile" } }, // Force the model to call our function
  });

  // FIX: The arguments are now found in the 'tool_calls' array of the first choice.
  const toolCall = response.choices[0]?.message?.tool_calls?.[0];
  const args = toolCall?.function?.arguments;

  if (!args) {
    throw new Error("Missing function call arguments in the AI's response.");
  }

  try {
    const parsed = JSON.parse(args) as StrainProfile;
    return parsed;
  } catch (error) {
    console.error("Failed to parse function call arguments:", args);
    throw new Error("The AI returned invalid JSON for the function call.");
  }
}

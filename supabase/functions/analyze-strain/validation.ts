
interface StrainData {
  name?: string;
  type?: string;
  thc?: number;
  cbd?: number;
  effects?: string[];
  flavors?: string[];
  terpenes?: any[];
  medicalUses?: string[];
  description?: string;
  confidence?: number;
}

export const createFallbackStrain = (textQuery?: string) => ({
  name: textQuery ? textQuery.replace(/[^\w\s]/g, '').trim() : "Mystery Hybrid",
  type: "Hybrid",
  thc: 20,
  cbd: 2,
  effects: ["Relaxed", "Happy", "Euphoric", "Creative"],
  flavors: ["Earthy", "Sweet", "Pine"],
  terpenes: [
    {"name": "Myrcene", "percentage": 1.2, "effects": "Sedating and relaxing"},
    {"name": "Limonene", "percentage": 0.8, "effects": "Uplifting and stress-relieving"},
    {"name": "Pinene", "percentage": 0.6, "effects": "Alertness and memory retention"}
  ],
  medicalUses: ["Pain Relief", "Stress Relief", "Anxiety", "Insomnia"],
  description: "A balanced hybrid strain with moderate THC levels. This strain typically provides a well-rounded experience combining relaxation with mental clarity. The earthy and sweet flavor profile makes it appealing to many users, while its therapeutic properties make it suitable for various medical applications including pain and stress management.",
  confidence: textQuery ? 85 : 25
});

export const parseOpenAIResponse = (analysisText: string, textQuery?: string) => {
  let strainData: StrainData;
  
  try {
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      strainData = JSON.parse(jsonMatch[0]);
    } else {
      strainData = JSON.parse(analysisText);
    }
  } catch (parseError) {
    console.error('Error parsing OpenAI response:', parseError);
    return createFallbackStrain(textQuery);
  }

  return strainData;
};

// Function to clean THC mentions from descriptions
const cleanTHCFromDescription = (description: string): string => {
  if (!description) return description;
  
  // Remove patterns like "THC: 21%" or "21% THC" or "THC levels of 21%" from the beginning of descriptions
  let cleaned = description
    .replace(/^THC:\s*\d+(\.\d+)?%\s*/i, '')
    .replace(/^\d+(\.\d+)?%\s*THC\s*/i, '')
    .replace(/^THC\s*levels?\s*of\s*\d+(\.\d+)?%\s*/i, '')
    .replace(/^With\s*\d+(\.\d+)?%\s*THC\s*/i, '')
    .replace(/^At\s*\d+(\.\d+)?%\s*THC\s*/i, '')
    .trim();
  
  // Remove standalone THC mentions at the start of sentences
  cleaned = cleaned.replace(/^THC\s*\d+(\.\d+)?%[.,]\s*/i, '');
  
  // Ensure the description starts with a capital letter after cleaning
  if (cleaned && cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  return cleaned || description; // Return original if cleaning resulted in empty string
};

export const validateStrainData = (strainData: StrainData, textQuery?: string) => {
  const cleanedDescription = cleanTHCFromDescription(strainData.description || "");
  
  return {
    name: strainData.name || (textQuery ? textQuery.replace(/[^\w\s]/g, '').trim() : "Unknown Strain"),
    type: ['Indica', 'Sativa', 'Hybrid'].includes(strainData.type || '') ? strainData.type : 'Hybrid',
    thc: Math.min(Math.max(Number(strainData.thc) || 20, 0), 35),
    cbd: Math.min(Math.max(Number(strainData.cbd) || 1, 0), 25),
    effects: Array.isArray(strainData.effects) ? strainData.effects.slice(0, 8) : ["Relaxed", "Happy", "Euphoric"],
    flavors: Array.isArray(strainData.flavors) ? strainData.flavors.slice(0, 6) : ["Earthy", "Sweet"],
    terpenes: Array.isArray(strainData.terpenes) ? strainData.terpenes.slice(0, 6) : [
      {"name": "Myrcene", "percentage": 1.0, "effects": "Relaxing and sedating"},
      {"name": "Limonene", "percentage": 0.7, "effects": "Mood elevation and stress relief"}
    ],
    medicalUses: Array.isArray(strainData.medicalUses) ? strainData.medicalUses.slice(0, 6) : ["Pain Relief", "Stress Relief"],
    description: cleanedDescription || "AI-analyzed cannabis strain with balanced effects and therapeutic potential.",
    confidence: Math.min(Math.max(Number(strainData.confidence) || (textQuery ? 85 : 75), 0), 100)
  };
};

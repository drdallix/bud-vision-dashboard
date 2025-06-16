
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
  confidence: textQuery ? 45 : 15 // Much lower confidence for fallback strains
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

// Function to calculate realistic confidence based on various factors
const calculateRealisticConfidence = (strainData: StrainData, textQuery?: string, hasImage?: boolean): number => {
  let baseConfidence = 30; // Start with low base confidence
  
  // Image analysis vs text query
  if (hasImage) {
    baseConfidence += 25; // Images provide more data
  } else if (textQuery) {
    baseConfidence += 15; // Text queries are less reliable
  }
  
  // Well-known strain names get higher confidence
  const wellKnownStrains = [
    'blue dream', 'og kush', 'white widow', 'ak-47', 'northern lights',
    'sour diesel', 'girl scout cookies', 'granddaddy purple', 'green crack',
    'pineapple express', 'jack herer', 'bubba kush', 'purple haze',
    'amnesia haze', 'super silver haze', 'lemon skunk', 'cherry pie',
    'gelato', 'wedding cake', 'gorilla glue', 'zkittles'
  ];
  
  const strainName = (strainData.name || '').toLowerCase();
  const isWellKnown = wellKnownStrains.some(known => 
    strainName.includes(known) || known.includes(strainName)
  );
  
  if (isWellKnown) {
    baseConfidence += 20;
  }
  
  // Realistic effects and flavors boost confidence slightly
  const commonEffects = ['relaxed', 'happy', 'euphoric', 'uplifted', 'creative', 'focused', 'energetic', 'sleepy'];
  const commonFlavors = ['earthy', 'sweet', 'citrus', 'pine', 'diesel', 'berry', 'vanilla', 'spicy'];
  
  const effectsMatch = (strainData.effects || []).filter(effect => 
    commonEffects.includes(effect.toLowerCase())
  ).length;
  
  const flavorsMatch = (strainData.flavors || []).filter(flavor => 
    commonFlavors.includes(flavor.toLowerCase())
  ).length;
  
  baseConfidence += Math.min(effectsMatch * 2, 10); // Max 10 bonus from effects
  baseConfidence += Math.min(flavorsMatch * 2, 8);   // Max 8 bonus from flavors
  
  // THC levels within realistic ranges
  const thc = Number(strainData.thc) || 0;
  if (thc >= 15 && thc <= 30) {
    baseConfidence += 8; // Realistic THC range
  } else if (thc > 30 || thc < 5) {
    baseConfidence -= 5; // Unrealistic THC levels lower confidence
  }
  
  // Penalty for very generic descriptions
  const description = (strainData.description || '').toLowerCase();
  if (description.length < 50 || 
      description.includes('balanced') && description.includes('effects') && description.includes('strain')) {
    baseConfidence -= 5; // Generic descriptions are less reliable
  }
  
  // Cap confidence at reasonable levels (AI should never be too confident)
  return Math.min(Math.max(baseConfidence, 10), 75); // Min 10%, Max 75%
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

export const validateStrainData = (strainData: StrainData, textQuery?: string, hasImage?: boolean) => {
  const cleanedDescription = cleanTHCFromDescription(strainData.description || "");
  
  // Calculate realistic confidence
  const realisticConfidence = calculateRealisticConfidence(strainData, textQuery, hasImage);
  
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
    confidence: realisticConfidence // Use the calculated realistic confidence
  };
};

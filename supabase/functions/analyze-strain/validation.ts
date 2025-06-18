
export const parseOpenAIResponse = (analysisText: string, textQuery?: string) => {
  try {
    // Remove any markdown code blocks
    const cleanedText = analysisText.replace(/```json\n?|\n?```/g, '');
    const parsed = JSON.parse(cleanedText);
    
    console.log('Parsed OpenAI response:', {
      name: parsed.name,
      type: parsed.type,
      thc: parsed.thc,
      effectProfilesCount: parsed.effectProfiles?.length || 0,
      flavorProfilesCount: parsed.flavorProfiles?.length || 0,
      hasDescription: !!parsed.description
    });
    
    return parsed;
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error);
    console.error('Raw response:', analysisText);
    throw new Error('Invalid JSON response from OpenAI');
  }
};

export const validateStrainData = (strainData: any, textQuery?: string) => {
  // Ensure required fields exist
  const validated = {
    name: strainData.name || (textQuery ? textQuery.trim() : "Unknown Strain"),
    type: ['Indica', 'Sativa', 'Hybrid'].includes(strainData.type) ? strainData.type : 'Hybrid',
    thc: typeof strainData.thc === 'number' ? strainData.thc : 21,
    cbd: typeof strainData.cbd === 'number' ? strainData.cbd : 1,
    effectProfiles: Array.isArray(strainData.effectProfiles) ? strainData.effectProfiles : [],
    flavorProfiles: Array.isArray(strainData.flavorProfiles) ? strainData.flavorProfiles : [],
    terpenes: Array.isArray(strainData.terpenes) ? strainData.terpenes : [],
    medicalUses: Array.isArray(strainData.medicalUses) ? strainData.medicalUses : [],
    description: typeof strainData.description === 'string' ? strainData.description : '',
    confidence: typeof strainData.confidence === 'number' ? strainData.confidence : 85
  };

  // Validate effect profiles structure
  validated.effectProfiles = validated.effectProfiles.filter(effect => 
    effect && typeof effect.name === 'string' && 
    typeof effect.intensity === 'number' && 
    typeof effect.emoji === 'string' && 
    typeof effect.color === 'string'
  );

  // Validate flavor profiles structure
  validated.flavorProfiles = validated.flavorProfiles.filter(flavor => 
    flavor && typeof flavor.name === 'string' && 
    typeof flavor.intensity === 'number' && 
    typeof flavor.emoji === 'string' && 
    typeof flavor.color === 'string'
  );

  console.log('Validated strain data:', {
    name: validated.name,
    effectProfilesValid: validated.effectProfiles.length,
    flavorProfilesValid: validated.flavorProfiles.length,
    descriptionLength: validated.description.length
  });

  return validated;
};

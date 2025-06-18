
import { supabase } from '@/integrations/supabase/client';
import { Strain } from '@/types/strain';
import { getDeterministicTHCRange } from '@/utils/thcGenerator';

export const analyzeStrainWithAI = async (imageData?: string, textQuery?: string, userId?: string) => {
  try {
    console.log('Calling AI strain analysis...', textQuery ? 'with text query' : 'with image');
    
    // Calculate the deterministic THC range before making the API call
    const strainName = textQuery ? textQuery.replace(/[^\w\s]/g, '').trim() || "Mystery Strain" : "Mystery Strain";
    const [thcMin, thcMax] = getDeterministicTHCRange(strainName);
    
    console.log('Pre-calculated THC range for', strainName, ':', [thcMin, thcMax]);
    
    const requestBody: any = { 
      imageData: imageData || null,
      textQuery: textQuery || null
    };
    
    if (userId) {
      requestBody.userId = userId;
      console.log('Including userId in AI request for database save:', userId);
    }
    
    const { data, error } = await supabase.functions.invoke('analyze-strain', {
      body: requestBody
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }

    console.log('AI analysis result:', data);

    if (data.error) {
      console.error('Edge function returned error:', data.error);
      if (data.fallbackStrain) {
        // Ensure fallback strain also uses correct THC
        const fallback = {
          ...data.fallbackStrain,
          thc: thcMin // Use our deterministic calculation
        };
        return fallback;
      }
      throw new Error(data.error);
    }

    // Ensure the returned data uses our deterministic THC calculation
    const finalStrain = {
      ...data,
      thc: thcMin // Always override with our calculated value
    };

    console.log('Final strain with consistent THC:', {
      name: finalStrain.name,
      thc: finalStrain.thc,
      expectedRange: [thcMin, thcMax]
    });

    return finalStrain;
  } catch (error) {
    console.error('Error calling strain analysis:', error);
    
    // Fallback strain with correct THC calculation
    const fallbackName = textQuery ? textQuery.replace(/[^\w\s]/g, '').trim() || "Unknown Strain" : "Unknown Strain";
    const [fallbackThcMin] = getDeterministicTHCRange(fallbackName);
    
    return {
      name: fallbackName,
      type: "Hybrid" as const,
      thc: fallbackThcMin, // Use deterministic calculation
      effectProfiles: [
        { name: "Relaxed", intensity: 3, emoji: "😌", color: "#8B5CF6" },
        { name: "Happy", intensity: 4, emoji: "😊", color: "#F59E0B" }
      ],
      flavorProfiles: [
        { name: "Earthy", intensity: 3, emoji: "🌍", color: "#78716C" },
        { name: "Sweet", intensity: 2, emoji: "🍯", color: "#F59E0B" }
      ],
      terpenes: [{"name": "Myrcene", "percentage": 1.0, "effects": "Relaxing"}],
      description: textQuery ? 
        "Text analysis incomplete. Please check spelling and try again." :
        "Package scan incomplete. Please try again with clearer lighting and ensure all text is visible.",
      confidence: 0
    };
  }
};

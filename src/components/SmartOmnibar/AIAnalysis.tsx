
import { supabase } from '@/integrations/supabase/client';
import { Strain } from '@/types/strain';

export const analyzeStrainWithAI = async (imageData?: string, textQuery?: string) => {
  try {
    console.log('Calling AI strain analysis...', textQuery ? 'with text query' : 'with image');
    
    const { data, error } = await supabase.functions.invoke('analyze-strain', {
      body: { 
        imageData: imageData || null,
        textQuery: textQuery || null
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }

    console.log('AI analysis result:', data);

    if (data.error) {
      console.error('Edge function returned error:', data.error);
      if (data.fallbackStrain) {
        return data.fallbackStrain;
      }
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error('Error calling strain analysis:', error);
    return {
      name: textQuery || "Unknown Strain",
      type: "Hybrid" as const,
      thc: 15,
      cbd: 2,
      effects: ["Unknown"],
      flavors: ["Unknown"],
      terpenes: [{"name": "Myrcene", "percentage": 1.0, "effects": "Relaxing"}],
      medicalUses: ["Consult Professional"],
      description: textQuery ? 
        "Text analysis incomplete. Please check spelling and try again." :
        "Package scan incomplete. Please try again with clearer lighting and ensure all text is visible.",
      confidence: 0
    };
  }
};


import { supabase } from '@/integrations/supabase/client';
import { Strain } from '@/types/strain';

export const analyzeStrainWithAI = async (imageData?: string, textQuery?: string, userId?: string) => {
  try {
    console.log('Calling AI strain analysis...', textQuery ? 'with text query' : 'with image');
    
    const requestBody: any = { 
      imageData: imageData || null,
      textQuery: textQuery || null
    };
    
    if (userId) {
      requestBody.userId = userId;
      console.log('Including userId in AI request:', userId);
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
      thc: Math.max(21, Math.floor(Math.random() * 8) + 21), // 21-28% THC
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


import { supabase } from '@/integrations/supabase/client';
import { Strain } from '@/types/strain';
import { getDeterministicTHCRange } from '@/utils/thcGenerator';

export const analyzeStrainWithAI = async (imageData?: string, textQuery?: string, userId?: string) => {
  try {
    console.log('Calling AI strain analysis...', textQuery ? 'with text query' : 'with image');
    
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
        console.log('Using fallback strain from edge function');
        return data.fallbackStrain;
      }
      throw new Error(data.error);
    }

    // CRITICAL FIX: Use AI-generated content directly, don't override
    console.log('Using AI-generated content directly:', {
      name: data.name,
      description: data.description?.substring(0, 100) + '...',
      thc: data.thc,
      hasDescription: !!data.description
    });

    return data;
  } catch (error) {
    console.error('Error calling strain analysis:', error);
    
    // Only create fallback if absolutely necessary
    const fallbackName = textQuery ? textQuery.replace(/[^\w\s]/g, '').trim() || "Unknown Strain" : "Unknown Strain";
    const [fallbackThcMin] = getDeterministicTHCRange(fallbackName);
    
    console.log('Creating minimal fallback strain due to error');
    
    return {
      name: fallbackName,
      type: "Hybrid" as const,
      thc: fallbackThcMin,
      effectProfiles: [
        { name: "Relaxed", intensity: 3, emoji: "😌", color: "#8B5CF6" },
        { name: "Happy", intensity: 4, emoji: "😊", color: "#F59E0B" }
      ],
      flavorProfiles: [
        { name: "Earthy", intensity: 3, emoji: "🌍", color: "#78716C" },
        { name: "Sweet", intensity: 2, emoji: "🍯", color: "#F59E0B" }
      ],
      terpenes: [{"name": "Myrcene", "percentage": 1.0, "effects": "Relaxing"}],
      description: `Analysis incomplete for ${fallbackName}. Please try again with clearer information for a detailed description.`,
      confidence: 0
    };
  }
};

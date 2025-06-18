
import { supabase } from '@/integrations/supabase/client';
import { Strain } from '@/types/strain';
import { getDeterministicTHCRange } from '@/utils/thcGenerator';

export const analyzeStrainWithAI = async (imageData?: string, textQuery?: string, userId?: string) => {
  try {
    console.log('=== AI STRAIN ANALYSIS START ===');
    console.log('Input type:', textQuery ? 'text query' : 'image');
    console.log('Text query:', textQuery);
    console.log('Has image data:', !!imageData);
    console.log('User ID:', userId);
    
    const requestBody: any = { 
      imageData: imageData || null,
      textQuery: textQuery || null
    };
    
    if (userId) {
      requestBody.userId = userId;
      console.log('Including userId for database save:', userId);
    }
    
    console.log('Calling Supabase edge function...');
    const { data, error } = await supabase.functions.invoke('analyze-strain', {
      body: requestBody
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }

    console.log('Edge function response:', data);

    if (data.error) {
      console.error('Edge function returned error:', data.error);
      if (data.fallbackStrain) {
        console.log('Using fallback strain from edge function');
        return data.fallbackStrain;
      }
      throw new Error(data.error);
    }

    // The edge function now returns complete strain data with structured profiles
    const finalStrain: Strain = {
      id: data.id || crypto.randomUUID(),
      name: data.name,
      type: data.type,
      thc: data.thc, // THC is set by edge function with deterministic logic
      cbd: data.cbd,
      effectProfiles: data.effectProfiles || [],
      flavorProfiles: data.flavorProfiles || [],
      terpenes: data.terpenes || [],
      description: data.description,
      confidence: data.confidence,
      scannedAt: new Date().toISOString(),
      inStock: true,
      userId: userId || 'anonymous'
    };

    console.log('Final strain object:', {
      name: finalStrain.name,
      thc: finalStrain.thc,
      effectProfilesCount: finalStrain.effectProfiles.length,
      flavorProfilesCount: finalStrain.flavorProfiles.length,
      description: finalStrain.description?.substring(0, 100) + '...'
    });
    console.log('=== AI STRAIN ANALYSIS SUCCESS ===');

    return finalStrain;
  } catch (error) {
    console.error('=== AI STRAIN ANALYSIS ERROR ===');
    console.error('Error details:', error);
    
    // Fallback strain with structured profiles
    const fallbackName = textQuery ? textQuery.replace(/[^\w\s]/g, '').trim() || "Unknown Strain" : "Unknown Strain";
    const [fallbackThcMin] = getDeterministicTHCRange(fallbackName);
    
    const fallbackStrain: Strain = {
      id: crypto.randomUUID(),
      name: fallbackName,
      type: "Hybrid" as const,
      thc: fallbackThcMin,
      cbd: 1,
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
        "Analysis incomplete. Please check spelling and try again." :
        "Image scan incomplete. Please try again with clearer lighting and ensure all text is visible.",
      confidence: 0,
      scannedAt: new Date().toISOString(),
      inStock: true,
      userId: userId || 'anonymous'
    };

    console.log('Returning fallback strain:', fallbackStrain.name);
    console.log('=== AI STRAIN ANALYSIS FALLBACK ===');
    return fallbackStrain;
  }
};

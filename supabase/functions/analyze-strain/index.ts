
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCorsPreflightRequest } from './cors.ts';
import { createTextAnalysisMessages, createImageAnalysisMessages, callOpenAI, createEffectProfilesMessages, createFlavorProfilesMessages } from './openai.ts';
import { parseOpenAIResponse, validateStrainData } from './validation.ts';
import { cacheStrainData } from './cache.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  try {
    const { imageData, textQuery } = await req.json();
    if (!imageData && !textQuery) throw new Error('No image data or text query provided');
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!openAIApiKey) throw new Error('OpenAI API key not configured');

    // 1. PRIMARY BASIC STRAIN ANALYSIS
    const messages = textQuery 
      ? createTextAnalysisMessages(textQuery)
      : createImageAnalysisMessages(imageData);

    const data = await callOpenAI(messages, openAIApiKey);
    const analysisText = data.choices[0].message.content;
    const strainData = parseOpenAIResponse(analysisText, textQuery);
    const validatedStrain = validateStrainData(strainData, textQuery);

    // 2. EFFECT PROFILES
    let effectProfiles = [];
    try {
      const m2 = createEffectProfilesMessages(validatedStrain.name, validatedStrain.type, validatedStrain.effects);
      const effRes = await callOpenAI(m2, openAIApiKey);
      const effContent = effRes.choices[0].message.content;
      effectProfiles = JSON.parse(effContent);
    } catch (effectErr) {
      console.error('EffectProfiles AI step failed:', effectErr);
      // fallback: simple array with all intensity 3 and basic emoji/color
      effectProfiles = Array.isArray(validatedStrain.effects)
        ? validatedStrain.effects.map(name => ({
            name,
            intensity: 3,
            emoji: '🌿',
            color: '#10B981'
          }))
        : [];
    }

    // 3. FLAVOR PROFILES
    let flavorProfiles = [];
    try {
      const m3 = createFlavorProfilesMessages(validatedStrain.name, validatedStrain.type, validatedStrain.flavors);
      const flavRes = await callOpenAI(m3, openAIApiKey);
      const flavContent = flavRes.choices[0].message.content;
      flavorProfiles = JSON.parse(flavContent);
    } catch (flavorErr) {
      console.error('FlavorProfiles AI step failed:', flavorErr);
      flavorProfiles = Array.isArray(validatedStrain.flavors)
        ? validatedStrain.flavors.map(name => ({
            name,
            intensity: 3,
            emoji: '🌿',
            color: '#10B981'
          }))
        : [];
    }

    // Compose full enriched object
    const finalStrain = {
      ...validatedStrain,
      effectProfiles,
      flavorProfiles
    };

    // Cache as before if available
    if (supabaseUrl && supabaseKey) {
      try {
        await cacheStrainData(finalStrain, supabaseUrl, supabaseKey);
      } catch (cacheError) {
        console.error('Strain caching failed but not fatal:', cacheError);
      }
    }

    return new Response(JSON.stringify(finalStrain), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-strain chained:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze strain (chained)',
        details: error.message,
        fallbackStrain: {
          name: "Analysis Error",
          type: "Hybrid",
          thc: 18,
          cbd: 2,
          effects: ["Relaxed", "Happy"],
          flavors: ["Earthy"],
          terpenes: [{"name": "Myrcene", "percentage": 1.0, "effects": "Relaxing"}],
          medicalUses: ["Consult Professional"],
          description: "Analysis failed. Please try again with a clearer image or corrected spelling.",
          confidence: 0,
          effectProfiles: [],
          flavorProfiles: []
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

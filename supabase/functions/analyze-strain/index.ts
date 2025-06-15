
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCorsPreflightRequest } from './cors.ts';
import { createTextAnalysisMessages, createImageAnalysisMessages, callOpenAI, createEffectProfilesMessages, createFlavorProfilesMessages } from './openai.ts';
import { parseOpenAIResponse, validateStrainData } from './validation.ts';
import { cacheStrainData } from './cache.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { getDeterministicTHCRange } from './thcGenerator.ts';

// Emoji/color mappings for fallback
const EFFECT_MAP: Record<string, {emoji: string, color: string}> = {
  'Relaxed': { emoji: '😌', color: '#8B5CF6' },
  'Happy': { emoji: '😊', color: '#F59E0B' },
  'Euphoric': { emoji: '🤩', color: '#EF4444' },
  'Creative': { emoji: '🎨', color: '#3B82F6' },
  'Energetic': { emoji: '⚡', color: '#10B981' },
  'Focused': { emoji: '🎯', color: '#6366F1' },
  'Sleepy': { emoji: '😴', color: '#6B7280' },
  'Uplifted': { emoji: '🚀', color: '#F97316' },
  'Talkative': { emoji: '💬', color: '#EC4899' },
  'Giggly': { emoji: '😂', color: '#84CC16' },
};
const FLAVOR_MAP: Record<string, {emoji: string, color: string}> = {
  'Sweet': { emoji: '🍯', color: '#F59E0B' },
  'Earthy': { emoji: '🌍', color: '#78716C' },
  'Pine': { emoji: '🌲', color: '#059669' },
  'Citrus': { emoji: '🍋', color: '#EAB308' },
  'Berry': { emoji: '🫐', color: '#7C3AED' },
  'Diesel': { emoji: '⛽', color: '#374151' },
  'Vanilla': { emoji: '🍦', color: '#F3E8FF' },
  'Grape': { emoji: '🍇', color: '#8B5CF6' },
  'Woody': { emoji: '🪵', color: '#92400E' },
  'Tropical': { emoji: '🥭', color: '#F97316' },
  'Pungent': { emoji: '💨', color: '#6B7280' },
  'Spicy': { emoji: '🌶️', color: '#DC2626' }
};

function fallbackProfile(entries: string[], map: Record<string, {emoji: string, color: string}>, type: 'effect'|'flavor') {
  return entries.map(name => ({
    name,
    intensity: 3,
    emoji: map[name]?.emoji || '🌿',
    color: map[name]?.color || '#10B981'
  }));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  try {
    const { imageData, textQuery, userId } = await req.json();
    console.log('Request received:', { 
      hasImage: !!imageData, 
      hasText: !!textQuery, 
      userId: userId ? `${userId.substring(0, 8)}...` : 'none' 
    });
    
    if (!imageData && !textQuery) throw new Error('No image data or text query provided');
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!openAIApiKey) throw new Error('OpenAI API key not configured');

    // ======= DETERMINISTIC THC GENERATION =======
    let thcRange: [number, number] = [21, 26.5];
    let strainNameForTHC = textQuery || "Unknown";
    if (textQuery) {
      thcRange = getDeterministicTHCRange(textQuery);
      strainNameForTHC = textQuery;
    }

    // --- PRIMARY BASIC STRAIN ANALYSIS ---
    const messages = textQuery
      ? createTextAnalysisMessages(textQuery, thcRange)
      : createImageAnalysisMessages(imageData, strainNameForTHC, thcRange);

    const data = await callOpenAI(messages, openAIApiKey);
    const analysisText = data.choices[0].message.content;
    const strainData = parseOpenAIResponse(analysisText, textQuery);
    let validatedStrain = validateStrainData(strainData, textQuery);

    // Always OVERWRITE thc value with our deterministic average for the strain name
    const [thcMin, thcMax] = getDeterministicTHCRange(validatedStrain.name);
    const deterministicTHC = Number(((thcMin + thcMax) / 2).toFixed(2));
    validatedStrain.thc = deterministicTHC;

    // 2. EFFECT PROFILES
    let effectProfiles = [];
    try {
      const m2 = createEffectProfilesMessages(validatedStrain.name, validatedStrain.type, validatedStrain.effects);
      const effRes = await callOpenAI(m2, openAIApiKey);
      let effContent = effRes.choices[0].message.content.trim();
      if (effContent.startsWith("```")) {
        effContent = effContent.replace(/```[a-z]*\n?/i, '').replace(/```$/, '');
      }
      effectProfiles = JSON.parse(effContent);
      effectProfiles = effectProfiles.map((e: any) => ({
        ...e,
        emoji: e.emoji || EFFECT_MAP[e.name]?.emoji || '🌿',
        color: e.color || EFFECT_MAP[e.name]?.color || '#10B981'
      }));
    } catch (effectErr) {
      console.error('EffectProfiles AI step failed:', effectErr);
      effectProfiles = fallbackProfile(validatedStrain.effects, EFFECT_MAP, 'effect');
    }

    // 3. FLAVOR PROFILES
    let flavorProfiles = [];
    try {
      const m3 = createFlavorProfilesMessages(validatedStrain.name, validatedStrain.type, validatedStrain.flavors);
      const flavRes = await callOpenAI(m3, openAIApiKey);
      let flavContent = flavRes.choices[0].message.content.trim();
      if (flavContent.startsWith("```")) {
        flavContent = flavContent.replace(/```[a-z]*\n?/i, '').replace(/```$/, '');
      }
      flavorProfiles = JSON.parse(flavContent);
      flavorProfiles = flavorProfiles.map((f: any) => ({
        ...f,
        emoji: f.emoji || FLAVOR_MAP[f.name]?.emoji || '🌿',
        color: f.color || FLAVOR_MAP[f.name]?.color || '#10B981'
      }));
    } catch (flavorErr) {
      console.error('FlavorProfiles AI step failed:', flavorErr);
      flavorProfiles = fallbackProfile(validatedStrain.flavors, FLAVOR_MAP, 'flavor');
    }

    // Compose full enriched object
    const finalStrain = {
      ...validatedStrain,
      effectProfiles,
      flavorProfiles
    };

    // Cache strain data if supabase is available
    if (supabaseUrl && supabaseKey) {
      try {
        await cacheStrainData(finalStrain, supabaseUrl, supabaseKey);
      } catch (cacheError) {
        console.error('Strain caching failed but not fatal:', cacheError);
      }
      
      // Insert into scans if userId is available
      if (userId) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const entry = {
            user_id: userId,
            strain_name: finalStrain.name,
            strain_type: finalStrain.type,
            thc: finalStrain.thc,
            cbd: finalStrain.cbd,
            effects: finalStrain.effects,
            flavors: finalStrain.flavors,
            terpenes: finalStrain.terpenes,
            medical_uses: finalStrain.medicalUses,
            description: finalStrain.description,
            confidence: finalStrain.confidence,
            scanned_at: new Date().toISOString(),
            in_stock: true
          };
          
          console.log('Attempting to insert scan for user:', userId.substring(0, 8) + '...');
          const { data: insertData, error } = await supabase.from('scans').insert([entry]).select();
          
          if (error) {
            console.error('Database insert error:', {
              error: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint,
              userId: userId.substring(0, 8) + '...',
              strainName: entry.strain_name
            });
          } else {
            console.log('Successfully inserted scan:', {
              strainName: entry.strain_name,
              insertedId: insertData?.[0]?.id,
              userId: userId.substring(0, 8) + '...'
            });
          }
        } catch (dbErr) {
          console.error('Supabase DB insert failed:', {
            error: dbErr.message,
            userId: userId.substring(0, 8) + '...',
            strainName: finalStrain.name
          });
        }
      } else {
        console.warn('No userId provided for scan DB insert - strain will not be saved to database');
      }
    } else {
      console.warn('Supabase not configured - skipping database operations');
    }

    console.log('Analysis complete:', {
      strainName: finalStrain.name,
      confidence: finalStrain.confidence,
      userId: userId ? userId.substring(0, 8) + '...' : 'none'
    });

    return new Response(JSON.stringify(finalStrain), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-strain function:', {
      error: error.message,
      stack: error.stack
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze strain',
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

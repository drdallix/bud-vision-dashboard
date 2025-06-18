// index.ts

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { corsHeaders } from './cors.ts';
import { createTextAnalysisMessages, createImageAnalysisMessages, createEffectProfilesMessages, createFlavorProfilesMessages, callOpenAI } from './openai.ts';
import { parseOpenAIResponse, validateStrainData, createFallbackStrain } from './validation.ts';
import { getDeterministicTHCRange } from './thcGenerator.ts';
import { SUPPORTED_EFFECTS, SUPPORTED_FLAVORS, DEFAULT_EFFECT_PROFILE, DEFAULT_FLAVOR_PROFILE } from './profileConstants.ts'; // Import our new constants

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, textQuery, userId } = await req.json();
    
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Processing request:', { hasImage: !!imageData, hasText: !!textQuery, userId: userId || 'anonymous' });

    let strainNameToAnalyze = textQuery || (imageData ? "Mystery Strain from Image" : "Mystery Strain");

    // For image queries, a preliminary call might be needed to identify the strain name first
    // This logic can be refined, but for now we assume text query provides the name
    if (imageData && !textQuery) {
        const imageToTextMessages = createImageAnalysisMessages(imageData);
        const preliminaryResponse = await callOpenAI(imageToTextMessages, openAIApiKey);
        const preliminaryData = parseOpenAIResponse(preliminaryResponse.choices[0].message.content);
        strainNameToAnalyze = preliminaryData.name || "Mystery Strain from Image";
        console.log('Identified strain from image:', strainNameToAnalyze);
    }
    
    const cleanedName = strainNameToAnalyze.replace(/[^\w\s]/g, '').trim();
    const finalStrainName = cleanedName || "Mystery Strain";
    const thcRange = getDeterministicTHCRange(finalStrainName);
    console.log(`Using deterministic THC range for "${finalStrainName}":`, thcRange);

    const initialMessages = createTextAnalysisMessages(finalStrainName, thcRange);
    
    const analysisResponse = await callOpenAI(initialMessages, openAIApiKey);
    const analysisText = analysisResponse.choices[0].message.content;
    
    let strainData = parseOpenAIResponse(analysisText, finalStrainName);
    const validatedData = validateStrainData(strainData, finalStrainName);
    validatedData.thc = thcRange[0]; // Ensure deterministic THC

    console.log('Validated data:', { name: validatedData.name, effects: validatedData.effects, flavors: validatedData.flavors });

    // --- REVISED PROFILE GENERATION ---
    let effectProfiles = [];
    if (validatedData.effects && validatedData.effects.length > 0) {
      try {
        const effectMessages = createEffectProfilesMessages(validatedData.name, validatedData.type, validatedData.effects);
        const effectResponse = await callOpenAI(effectMessages, openAIApiKey);
        const effectText = effectResponse.choices[0].message.content;
        effectProfiles = JSON.parse(effectText.replace(/```json\n?|\n?```/g, ''));
        console.log('Successfully generated dynamic effect profiles from OpenAI.');
      } catch (error) {
        console.error('Error generating dynamic effect profiles, creating profiles from validated data instead:', error.message);
        // SMART FALLBACK: Map the effects from the initial call to our constants.
        effectProfiles = validatedData.effects.map(effect => {
            const profile = SUPPORTED_EFFECTS[effect] || { ...DEFAULT_EFFECT_PROFILE, name: effect };
            return { ...profile, intensity: 3 }; // Add a default intensity
        });
      }
    }

    let flavorProfiles = [];
    if (validatedData.flavors && validatedData.flavors.length > 0) {
      try {
        const flavorMessages = createFlavorProfilesMessages(validatedData.name, validatedData.type, validatedData.flavors);
        const flavorResponse = await callOpenAI(flavorMessages, openAIApiKey);
        const flavorText = flavorResponse.choices[0].message.content;
        flavorProfiles = JSON.parse(flavorText.replace(/```json\n?|\n?```/g, ''));
        console.log('Successfully generated dynamic flavor profiles from OpenAI.');
      } catch (error) {
        console.error('Error generating dynamic flavor profiles, creating profiles from validated data instead:', error.message);
        // SMART FALLBACK: Map the flavors from the initial call to our constants.
        flavorProfiles = validatedData.flavors.map(flavor => {
            const profile = SUPPORTED_FLAVORS[flavor] || { ...DEFAULT_FLAVOR_PROFILE, name: flavor };
            return { ...profile, intensity: 3 }; // Add a default intensity
        });
      }
    }
    
    const finalStrain = {
      name: validatedData.name,
      type: validatedData.type,
      thc: validatedData.thc,
      effectProfiles, // Use the generated or fallback profiles
      flavorProfiles, // Use the generated or fallback profiles
      terpenes: validatedData.terpenes || [],
      description: validatedData.description,
      confidence: validatedData.confidence
    };

    console.log('Final strain object created:', { name: finalStrain.name, thc: finalStrain.thc });

    if (userId) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { error } = await supabase.from('scans').insert({
          user_id: userId,
          strain_name: finalStrain.name,
          strain_type: finalStrain.type,
          thc: finalStrain.thc,
          cbd: validatedData.cbd || 1,
          effects: validatedData.effects || [],
          flavors: validatedData.flavors || [],
          terpenes: finalStrain.terpenes,
          medical_uses: validatedData.medicalUses || [],
          description: finalStrain.description,
          confidence: finalStrain.confidence,
        });
        if (error) console.error('Database save error:', error);
        else console.log('Scan saved to database for user:', userId);
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
      }
    }

    return new Response(JSON.stringify(finalStrain), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Edge function error:', error.message);
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred.',
      fallbackStrain: createFallbackStrain(req.body ? (await req.json()).textQuery : undefined) 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

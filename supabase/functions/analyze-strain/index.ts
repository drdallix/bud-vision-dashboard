
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { corsHeaders } from './cors.ts';
import { createTextAnalysisMessages, createImageAnalysisMessages, callOpenAI } from './openai.ts';
import { parseOpenAIResponse, validateStrainData } from './validation.ts';
import { getDeterministicTHCRange } from './thcGenerator.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, textQuery, userId } = await req.json();
    
    console.log('=== SUPABASE EDGE FUNCTION START ===');
    console.log('Request details:', {
      hasImage: !!imageData,
      hasText: !!textQuery,
      userId: userId || 'anonymous'
    });
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        fallbackStrain: null
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let strainName = textQuery || "Mystery Strain";
    let thcRange: [number, number];

    if (textQuery) {
      const cleanedName = textQuery.replace(/[^\w\s]/g, '').trim();
      strainName = cleanedName || "Mystery Strain";
      thcRange = getDeterministicTHCRange(strainName);
      console.log('Text analysis - Strain name:', strainName, 'THC range:', thcRange);
    } else {
      thcRange = getDeterministicTHCRange("Mystery Strain");
      console.log('Image analysis - Default THC range:', thcRange);
    }

    // Create messages for AI analysis
    const messages = textQuery 
      ? createTextAnalysisMessages(textQuery, thcRange)
      : createImageAnalysisMessages(imageData!, strainName, thcRange);

    console.log('Calling OpenAI API...');
    const analysisResponse = await callOpenAI(messages, openAIApiKey);
    const analysisText = analysisResponse.choices[0].message.content;
    
    console.log('OpenAI response received, parsing...');
    let strainData = parseOpenAIResponse(analysisText, textQuery);
    
    // Update THC range if strain name was discovered from image
    if (!textQuery && strainData.name && strainData.name !== "Mystery Strain") {
      const actualThcRange = getDeterministicTHCRange(strainData.name);
      console.log('Image analysis discovered strain:', strainData.name, 'New THC range:', actualThcRange);
      thcRange = actualThcRange;
    }

    // Validate and clean the strain data
    const validatedData = validateStrainData(strainData, textQuery);
    
    // Always override THC with our deterministic value
    validatedData.thc = thcRange[0];

    console.log('Strain data validated:', {
      name: validatedData.name,
      thc: validatedData.thc,
      effectProfilesCount: validatedData.effectProfiles?.length || 0,
      flavorProfilesCount: validatedData.flavorProfiles?.length || 0
    });

    // Randomize profile order for visual diversity
    if (validatedData.effectProfiles) {
      validatedData.effectProfiles = shuffleArray([...validatedData.effectProfiles]);
    }
    if (validatedData.flavorProfiles) {
      validatedData.flavorProfiles = shuffleArray([...validatedData.flavorProfiles]);
    }

    // Create the final strain object
    const finalStrain = {
      name: validatedData.name,
      type: validatedData.type,
      thc: thcRange[0], // Always use deterministic calculation
      cbd: validatedData.cbd || 1,
      effectProfiles: validatedData.effectProfiles || [],
      flavorProfiles: validatedData.flavorProfiles || [],
      terpenes: validatedData.terpenes || [],
      description: validatedData.description,
      confidence: validatedData.confidence
    };

    console.log('Final strain object created:', {
      name: finalStrain.name,
      thc: finalStrain.thc,
      effectsCount: finalStrain.effectProfiles.length,
      flavorsCount: finalStrain.flavorProfiles.length,
      descriptionLength: finalStrain.description?.length || 0
    });

    // Save to database if userId is provided
    if (userId) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const scanData = {
          user_id: userId,
          strain_name: finalStrain.name,
          strain_type: finalStrain.type,
          thc: finalStrain.thc,
          cbd: finalStrain.cbd,
          effects: finalStrain.effectProfiles, // Now storing structured profiles as jsonb
          flavors: finalStrain.flavorProfiles, // Now storing structured profiles as jsonb
          terpenes: finalStrain.terpenes,
          medical_uses: validatedData.medicalUses || [],
          description: finalStrain.description,
          confidence: finalStrain.confidence,
          scanned_at: new Date().toISOString(),
          in_stock: true
        };

        console.log('Saving to database...');
        const { data, error } = await supabase
          .from('scans')
          .insert(scanData)
          .select()
          .single();

        if (error) {
          console.error('Database save error:', error);
        } else {
          console.log('Strain saved to database with ID:', data.id);
        }
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
      }
    }

    console.log('=== SUPABASE EDGE FUNCTION SUCCESS ===');
    return new Response(JSON.stringify(finalStrain), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('=== SUPABASE EDGE FUNCTION ERROR ===');
    console.error('Error details:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      fallbackStrain: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

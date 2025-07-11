
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { corsHeaders } from './cors.ts';
import { createTextAnalysisMessages, createImageAnalysisMessages, createEffectProfilesMessages, createFlavorProfilesMessages, callOpenAI } from './openai.ts';
import { createWebInformedTextAnalysisMessages, getStrainInfoWithPerplexity } from './perplexity.ts';
import { parseOpenAIResponse, validateStrainData } from './validation.ts';
import { getDeterministicTHCRange } from './thcGenerator.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, textQuery, userId } = await req.json();
    
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

    if (!userId) {
      console.error('User ID is required for database operations');
      return new Response(JSON.stringify({ 
        error: 'User authentication required',
        fallbackStrain: null
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Processing strain analysis request:', {
      hasImage: !!imageData,
      hasText: !!textQuery,
      hasPerplexity: !!perplexityApiKey,
      userId: userId
    });

    let strainName = textQuery || "Mystery Strain";
    let initialMessages;
    let thcRange: [number, number];
    let webInfo = '';
    let sources: string[] = [];

    if (textQuery) {
      // For text queries, we need to clean the name first to get consistent THC
      const cleanedName = textQuery.replace(/[^\w\s]/g, '').trim();
      strainName = cleanedName || "Mystery Strain";
      thcRange = getDeterministicTHCRange(strainName);

      // Get web information if Perplexity is available
      if (perplexityApiKey) {
        try {
          console.log('Fetching web information for strain:', strainName);
          const webData = await getStrainInfoWithPerplexity(strainName, perplexityApiKey);
          webInfo = webData.description;
          sources = webData.sources;
          console.log('Web info retrieved:', webInfo ? 'Yes' : 'No');
          console.log('Sources found:', sources.length);
        } catch (error) {
          console.error('Perplexity search failed:', error);
          webInfo = '';
          sources = [];
        }
      }

      // Use web-informed messages if we have web info
      if (webInfo) {
        initialMessages = createWebInformedTextAnalysisMessages(textQuery, thcRange, webInfo, sources);
      } else {
        initialMessages = createTextAnalysisMessages(textQuery, thcRange);
      }
    } else {
      // For image analysis, use a default name initially, we'll update after getting the real name
      thcRange = getDeterministicTHCRange("Mystery Strain");
      initialMessages = createImageAnalysisMessages(imageData!, strainName, thcRange);
    }

    console.log('Using THC range for', strainName, ':', thcRange);
    console.log('Using web-enhanced analysis:', !!webInfo);

    // Get initial strain analysis from OpenAI
    const analysisResponse = await callOpenAI(initialMessages, openAIApiKey);
    const analysisText = analysisResponse.choices[0].message.content;
    
    let strainData = parseOpenAIResponse(analysisText, textQuery);
    
    // If we got a strain name from image analysis, recalculate THC range with the actual name
    if (!textQuery && strainData.name && strainData.name !== "Mystery Strain") {
      const actualThcRange = getDeterministicTHCRange(strainData.name);
      console.log('Recalculating THC range for discovered strain:', strainData.name, actualThcRange);
      
      // Update the THC values to match our deterministic system
      strainData.thc = actualThcRange[0]; // Use the minimum as the main THC value
      thcRange = actualThcRange;
    } else {
      // Ensure THC matches our deterministic calculation
      strainData.thc = thcRange[0];
    }

    // Validate and clean the strain data
    const validatedData = validateStrainData(strainData, textQuery);
    
    // Override THC with our deterministic value to ensure consistency
    validatedData.thc = thcRange[0];

    console.log('Validated strain data with consistent THC:', {
      name: validatedData.name,
      thc: validatedData.thc,
      thcRange: thcRange,
      hasWebInfo: !!webInfo,
      sourcesIncluded: sources.length
    });

    // Generate enhanced effect profiles
    let effectProfiles = [];
    if (validatedData.effects && validatedData.effects.length > 0) {
      try {
        const effectMessages = createEffectProfilesMessages(
          validatedData.name, 
          validatedData.type, 
          validatedData.effects
        );
        const effectResponse = await callOpenAI(effectMessages, openAIApiKey);
        const effectText = effectResponse.choices[0].message.content;
        effectProfiles = JSON.parse(effectText.replace(/```json\n?|\n?```/g, ''));
        console.log('Generated effect profiles:', effectProfiles.length);
      } catch (error) {
        console.error('Error generating effect profiles:', error);
        effectProfiles = validatedData.effects.slice(0, 4).map((effect: string, index: number) => ({
          name: effect,
          intensity: Math.min(Math.max(Math.floor(Math.random() * 3) + 2, 1), 5),
          emoji: ['😌', '😊', '🤩', '💭'][index] || '✨',
          color: ['#8B5CF6', '#F59E0B', '#EF4444', '#10B981'][index] || '#6B7280'
        }));
      }
    }

    // Generate enhanced flavor profiles
    let flavorProfiles = [];
    if (validatedData.flavors && validatedData.flavors.length > 0) {
      try {
        const flavorMessages = createFlavorProfilesMessages(
          validatedData.name, 
          validatedData.type, 
          validatedData.flavors
        );
        const flavorResponse = await callOpenAI(flavorMessages, openAIApiKey);
        const flavorText = flavorResponse.choices[0].message.content;
        flavorProfiles = JSON.parse(flavorText.replace(/```json\n?|\n?```/g, ''));
        console.log('Generated flavor profiles:', flavorProfiles.length);
      } catch (error) {
        console.error('Error generating flavor profiles:', error);
        flavorProfiles = validatedData.flavors.slice(0, 3).map((flavor: string, index: number) => ({
          name: flavor,
          intensity: Math.min(Math.max(Math.floor(Math.random() * 3) + 2, 1), 5),
          emoji: ['🌍', '🍯', '🌲'][index] || '🌿',
          color: ['#78716C', '#F59E0B', '#10B981'][index] || '#6B7280'
        }));
      }
    }

    // CRITICAL: Save to database FIRST and ensure we get a valid ID
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const scanData = {
      user_id: userId,
      strain_name: validatedData.name,
      strain_type: validatedData.type,
      thc: thcRange[0],
      cbd: validatedData.cbd || 1,
      effects: validatedData.effects || [],
      flavors: validatedData.flavors || [],
      terpenes: validatedData.terpenes || [],
      medical_uses: validatedData.medicalUses || [],
      description: validatedData.description,
      confidence: webInfo ? 95 : validatedData.confidence,
      scanned_at: new Date().toISOString(),
      in_stock: true
    };

    const { data, error } = await supabase
      .from('scans')
      .insert(scanData)
      .select()
      .single();

    if (error || !data || !data.id) {
      console.error('CRITICAL: Database save failed:', error);
      throw new Error('Failed to save strain to database');
    }

    const databaseId = data.id;
    console.log('Strain saved to database with ID:', databaseId);

    // Create the final strain object with the database ID
    const finalStrain = {
      id: databaseId, // CRITICAL: Always include the database ID
      name: validatedData.name,
      type: validatedData.type,
      thc: thcRange[0],
      effectProfiles: effectProfiles,
      flavorProfiles: flavorProfiles,
      terpenes: validatedData.terpenes || [],
      description: validatedData.description,
      confidence: webInfo ? 95 : validatedData.confidence
    };

    console.log('Final strain object created with verified database ID:', {
      id: finalStrain.id,
      name: finalStrain.name,
      thc: finalStrain.thc,
      thcRange: thcRange,
      effectsCount: finalStrain.effectProfiles.length,
      flavorsCount: finalStrain.flavorProfiles.length,
      webEnhanced: !!webInfo,
      sourcesIncluded: sources.length
    });

    return new Response(JSON.stringify(finalStrain), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error: ' + error.message,
      fallbackStrain: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

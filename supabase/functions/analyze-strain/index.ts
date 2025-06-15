
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCorsPreflightRequest } from './cors.ts';
import { createTextAnalysisMessages, createImageAnalysisMessages, callOpenAI } from './openai.ts';
import { parseOpenAIResponse, validateStrainData } from './validation.ts';
import { cacheStrainData } from './cache.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  try {
    const { imageData, textQuery } = await req.json();
    
    if (!imageData && !textQuery) {
      throw new Error('No image data or text query provided');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Analyzing with OpenAI Vision...', textQuery ? 'Text query mode' : 'Image mode');

    // Create appropriate messages based on input type
    const messages = textQuery 
      ? createTextAnalysisMessages(textQuery)
      : createImageAnalysisMessages(imageData);

    // Call OpenAI API
    const data = await callOpenAI(messages, openAIApiKey);
    const analysisText = data.choices[0].message.content;
    
    console.log('Raw OpenAI response:', analysisText);

    // Parse and validate the response
    const strainData = parseOpenAIResponse(analysisText, textQuery);
    const validatedStrain = validateStrainData(strainData, textQuery);

    // Try to cache the strain analysis for future reference
    if (supabaseUrl && supabaseKey) {
      await cacheStrainData(validatedStrain, supabaseUrl, supabaseKey);
    }

    console.log('Validated strain data:', validatedStrain);

    return new Response(JSON.stringify(validatedStrain), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-strain function:', error);
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
          confidence: 0
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

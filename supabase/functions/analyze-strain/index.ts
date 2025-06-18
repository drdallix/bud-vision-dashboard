// index.ts

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { corsHeaders } from './cors.ts';
// Import the new, self-contained analyzeStrain function
import { analyzeStrain, StrainProfile } from './openai.ts'; 
// We still need a fallback for critical errors
import { createFallbackStrain } from './validation.ts'; 

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // This function now primarily handles text queries as the new openai.ts is optimized for it.
    const { textQuery, userId } = await req.json();
    
    // Check for API key and the required textQuery.
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (!textQuery) {
        return new Response(JSON.stringify({ error: 'Missing textQuery parameter' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    console.log(`Processing request for query: "${textQuery}", UserID: ${userId || 'anonymous'}`);

    // The entire multi-step process is now replaced with a single, robust call.
    // The new `analyzeStrain` function handles name correction, data validation,
    // and description generation all in one step via the function-calling API.
    const finalStrain: StrainProfile = await analyzeStrain(textQuery, openAIApiKey);

    console.log('Successfully generated strain profile:', { name: finalStrain.name, thc: finalStrain.thc });

    // Save the complete profile to the database if a userId is provided.
    if (userId) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // The data to insert now directly matches the StrainProfile type.
        const scanData = {
          user_id: userId,
          strain_name: finalStrain.name,
          strain_type: finalStrain.type,
          thc: finalStrain.thc,
          cbd: finalStrain.cbd,
          effects: finalStrain.effects,
          flavors: finalStrain.flavors,
          terpenes: [], // The new profile doesn't generate terpenes, can be added back if needed.
          medical_uses: [], // The new profile doesn't generate medical uses, can be added back if needed.
          description: finalStrain.description,
          confidence: finalStrain.confidence,
          scanned_at: new Date().toISOString(),
          in_stock: true // Default value
        };

        const { error } = await supabase
          .from('scans')
          .insert(scanData);

        if (error) {
          console.error('Database save error:', error);
        } else {
          console.log('Strain saved to database for user:', userId);
        }
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
      }
    }

    // Return the generated profile. Note: It does not contain the enhanced
    // `effectProfiles` or `flavorProfiles` as the new `openai.ts` doesn't create them.
    return new Response(JSON.stringify(finalStrain), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Edge function error:', error.message);
    // Use a fallback strain in case of a critical failure during the process.
    const requestBody = await req.text();
    const query = requestBody ? JSON.parse(requestBody).textQuery : undefined;
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred during strain analysis.',
      fallbackStrain: createFallbackStrain(query) 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

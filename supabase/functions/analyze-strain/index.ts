
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { corsHeaders } from './cors.ts';
import { analyzeStrain, StrainProfile } from './openai.ts'; 
import { createFallbackStrain } from './validation.ts'; 

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { textQuery, imageData, userId } = await req.json();
    
    console.log('🔥 EDGE FUNCTION: Starting strain analysis', {
      hasText: !!textQuery,
      hasImage: !!imageData,
      userId: userId || 'anonymous',
      timestamp: new Date().toISOString()
    });
    
    // Check for API key and required input
    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not configured');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (!textQuery && !imageData) {
      console.error('❌ Missing required input parameters');
      return new Response(JSON.stringify({ error: 'Missing textQuery or imageData parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🤖 Calling OpenAI analysis with:', {
      inputType: textQuery ? 'text' : 'image',
      query: textQuery || 'image analysis'
    });

    // Call the AI analysis function
    const finalStrain: StrainProfile = await analyzeStrain(textQuery, imageData, openAIApiKey);

    console.log('✅ AI analysis completed successfully:', {
      name: finalStrain.name,
      type: finalStrain.type,
      thc: finalStrain.thc,
      cbd: finalStrain.cbd,
      descriptionLength: finalStrain.description?.length || 0,
      effectsCount: finalStrain.effects?.length || 0,
      flavorsCount: finalStrain.flavors?.length || 0,
      confidence: finalStrain.confidence
    });

    // Save to database if userId provided
    if (userId) {
      try {
        console.log('💾 Saving strain to database for user:', userId);
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const scanData = {
          user_id: userId,
          strain_name: finalStrain.name,
          strain_type: finalStrain.type,
          thc: finalStrain.thc,
          cbd: finalStrain.cbd,
          effects: finalStrain.effects || [],
          flavors: finalStrain.flavors || [],
          terpenes: finalStrain.terpenes || [],
          medical_uses: finalStrain.medicalUses || [],
          description: finalStrain.description, // CRITICAL: Use AI description directly
          confidence: finalStrain.confidence,
          scanned_at: new Date().toISOString(),
          in_stock: true
        };

        console.log('📝 Database save data:', {
          strain_name: scanData.strain_name,
          description_length: scanData.description?.length || 0,
          description_preview: scanData.description?.substring(0, 100) + '...'
        });

        const { data: savedData, error } = await supabase
          .from('scans')
          .insert(scanData)
          .select()
          .single();

        if (error) {
          console.error('❌ Database save error:', error);
        } else {
          console.log('✅ Strain saved to database with ID:', savedData.id);
        }
      } catch (dbError) {
        console.error('💥 Database operation failed:', dbError);
      }
    }

    console.log('🎯 Returning final strain profile to client');
    
    // Return the AI-generated profile directly
    return new Response(JSON.stringify(finalStrain), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Edge function error:', error.message);
    
    // Create fallback strain for critical failures
    const requestBody = await req.text();
    let query;
    try {
      query = JSON.parse(requestBody)?.textQuery;
    } catch {
      query = undefined;
    }
    
    const fallbackStrain = createFallbackStrain(query);
    console.log('🔄 Using fallback strain:', fallbackStrain.name);
    
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred during strain analysis.',
      fallbackStrain 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

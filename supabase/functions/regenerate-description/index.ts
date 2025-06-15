
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      strainName, 
      strainType, 
      currentDescription, 
      humanGuidance, 
      effects, 
      flavors 
    } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create prompt for description regeneration
    const prompt = `You are an expert cannabis strain description writer. 

Current strain information:
- Name: ${strainName}
- Type: ${strainType}
- Current description: ${currentDescription}
- Effects: ${effects?.join(', ') || 'Not specified'}
- Flavors: ${flavors?.join(', ') || 'Not specified'}

Budtender guidance and corrections:
${humanGuidance}

Please rewrite the strain description incorporating the budtender's guidance. The description should be:
- Professional and informative
- Focused on customer experience
- Accurate to the guidance provided
- Around 100-150 words
- Without mentioning specific THC/CBD percentages

Return only the new description text, nothing else.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional cannabis strain description writer who creates accurate, engaging descriptions based on budtender input.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const description = data.choices[0].message.content.trim();

    console.log(`Generated new description for ${strainName}`);

    return new Response(
      JSON.stringify({ description }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in regenerate-description function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

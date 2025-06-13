
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, scanHistory } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Processing cannabis sommelier chat request...');

    // Build context from scan history
    const historyContext = scanHistory && scanHistory.length > 0 
      ? `\n\nUser's Scan History for Reference:\n${scanHistory.map((strain: any) => 
          `- ${strain.name} (${strain.type}): ${strain.thc}% THC, ${strain.cbd}% CBD, Effects: ${strain.effects.join(', ')}, Flavors: ${strain.flavors.join(', ')}`
        ).join('\n')}`
      : '';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert Cannabis Sommelier and consultant with deep knowledge of cannabis strains, terpenes, effects, and consumption methods. You provide personalized recommendations based on user preferences, medical needs, and their previous strain experiences.

Your expertise includes:
- Strain recommendations (Indica, Sativa, Hybrid)
- Terpene profiles and their effects
- THC/CBD ratios for different needs
- Consumption methods (flower, edibles, concentrates, etc.)
- Medical cannabis applications
- Flavor profiles and pairing suggestions
- Dosage guidance for beginners and experienced users

Guidelines:
- Always prioritize safety and recommend starting with low doses
- Ask clarifying questions to better understand user needs
- Reference their scan history when making recommendations
- Explain the science behind your recommendations (terpenes, cannabinoids)
- Be encouraging and educational
- Mention that they should consult healthcare providers for medical advice
- Keep responses concise but informative

${historyContext}`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('Cannabis sommelier response generated');

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in cannabis-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate response',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

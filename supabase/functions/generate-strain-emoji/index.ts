
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { corsHeaders } from '../analyze-strain/cors.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { strainName, strainType, description, effects, flavors } = await req.json();
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        emoji: '🌿' // fallback emoji
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Generating emoji for strain:', strainName);

    const prompt = `Generate a single emoji that best represents the personality and character of this cannabis strain. Consider the strain's name, type, effects, and flavors to choose an emoji that captures its essence.

Strain Name: ${strainName}
Type: ${strainType}
Description: ${description || 'No description available'}
Effects: ${effects?.join(', ') || 'Unknown'}
Flavors: ${flavors?.join(', ') || 'Unknown'}

Guidelines:
- Choose ONE emoji that best captures the strain's personality
- Consider the effects (relaxing strains might get 😴, energetic ones 🚀, etc.)
- Consider flavors (fruity strains might get 🍓, earthy ones 🌍, etc.)
- Consider the name's vibe and character
- Avoid generic cannabis emojis like 🌿 or 🍃
- Be creative and fun with your choice

Respond with ONLY the single emoji character, nothing else.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a creative emoji selector. You respond with only a single emoji character that best represents the given cannabis strain.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 10,
        temperature: 0.8
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let emoji = data.choices[0].message.content.trim();
    
    // Clean up the response to ensure we only get the emoji
    emoji = emoji.replace(/[^^\p{Emoji}]/gu, '') || '🌿';
    
    // If we didn't get a valid emoji, provide a fallback based on type
    if (!emoji || emoji.length === 0) {
      switch (strainType) {
        case 'Indica': emoji = '🌙'; break;
        case 'Sativa': emoji = '☀️'; break;
        case 'Hybrid': emoji = '🌓'; break;
        default: emoji = '🌿';
      }
    }

    console.log('Generated emoji:', emoji);

    return new Response(JSON.stringify({ emoji }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      emoji: '🌿' // fallback emoji
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

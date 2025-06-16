
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { strainName, strainType, currentDescription, humanGuidance, effects, flavors } = await req.json()

    console.log('Regenerate description request:', { strainName, strainType, currentDescription, humanGuidance, effects, flavors })

    // Validate required inputs
    if (!strainName || !humanGuidance) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: strainName and humanGuidance are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY is not set')
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const prompt = `You are a cannabis expert writing product descriptions for a dispensary. 

Strain: ${strainName}
Type: ${strainType}
Current Description: ${currentDescription || 'None'}
Effects: ${effects?.join(', ') || 'None specified'}
Flavors: ${flavors?.join(', ') || 'None specified'}

Human Guidance/Corrections: ${humanGuidance}

Based on the human guidance provided, please regenerate an improved product description that:
1. Incorporates the specific feedback and corrections mentioned
2. Is professional and appealing to customers
3. Is 2-3 sentences long
4. Mentions key effects and flavors when relevant
5. Addresses any specific concerns or additions mentioned in the guidance

Write only the new description, nothing else.`

    console.log('Sending request to OpenAI...')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional cannabis copywriter. Write concise, accurate product descriptions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', errorText)
      
      // Handle rate limiting specifically
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'OpenAI API rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('OpenAI response received:', data)

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API')
    }

    const description = data.choices[0].message.content.trim()
    console.log('Generated description:', description)

    return new Response(
      JSON.stringify({ description }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in regenerate-description function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

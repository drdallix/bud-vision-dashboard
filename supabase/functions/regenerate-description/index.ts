
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

    console.log('Regenerate description request:', { strainName, strainType, humanGuidance })

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

    // IMPROVED: More specific prompt for better descriptions
    const descriptionPrompt = `You are a professional cannabis copywriter creating product descriptions for a dispensary.

Strain: ${strainName}
Type: ${strainType}
Current Description: ${currentDescription || 'None'}
Current Effects: ${effects?.join(', ') || 'None specified'}
Current Flavors: ${flavors?.join(', ') || 'None specified'}

Human Feedback: ${humanGuidance}

Create a compelling, professional product description that:
1. Incorporates the specific feedback provided
2. Highlights the strain's unique characteristics
3. Appeals to cannabis consumers
4. Is 2-3 engaging sentences
5. Mentions key effects and flavors naturally
6. Avoids generic cannabis clichés
7. Addresses the specific concerns mentioned in the feedback

Write ONLY the new description, nothing else.`

    console.log('Generating improved description with OpenAI...')
    const descriptionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a professional cannabis copywriter. Write compelling, specific product descriptions that avoid generic language and clichés. Focus on unique characteristics and authentic appeal.'
          },
          {
            role: 'user',
            content: descriptionPrompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    })

    if (!descriptionResponse.ok) {
      const errorText = await descriptionResponse.text()
      console.error('OpenAI API error:', errorText)
      
      if (descriptionResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'OpenAI API rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      throw new Error(`OpenAI API error: ${descriptionResponse.status}`)
    }

    const descriptionData = await descriptionResponse.json()
    if (!descriptionData.choices || !descriptionData.choices[0] || !descriptionData.choices[0].message) {
      throw new Error('Invalid response from OpenAI API')
    }

    const description = descriptionData.choices[0].message.content.trim()
    console.log('Generated description:', description.substring(0, 100) + '...')

    // Generate matching effects
    const effectsPrompt = `Based on this cannabis strain description, generate 4-6 realistic effects:

Strain: ${strainName} (${strainType})
Description: ${description}
Feedback: ${humanGuidance}

Generate effects that:
1. Match the strain type (${strainType})
2. Align with the description content
3. Are realistic and commonly used
4. Avoid generic repetition

Common effects: Relaxed, Happy, Euphoric, Uplifted, Creative, Focused, Sleepy, Hungry, Energetic, Giggly, Talkative, Aroused, Tingly, Calm

Return only a JSON array: ["effect1", "effect2", ...]`

    const effectsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'Generate realistic cannabis effect arrays. Return valid JSON only.'
          },
          {
            role: 'user',
            content: effectsPrompt
          }
        ],
        max_tokens: 100,
        temperature: 0.8,
      }),
    })

    // Generate matching flavors
    const flavorsPrompt = `Based on this cannabis strain description, generate 3-5 realistic flavors:

Strain: ${strainName} (${strainType})
Description: ${description}
Feedback: ${humanGuidance}

Generate flavors that:
1. Match the strain type
2. Align with the description
3. Are realistic and varied
4. Avoid generic combinations

Common flavors: Earthy, Sweet, Citrus, Pine, Berry, Diesel, Skunk, Floral, Spicy, Woody, Herbal, Fruity, Vanilla, Coffee, Chocolate

Return only a JSON array: ["flavor1", "flavor2", ...]`

    const flavorsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'Generate realistic cannabis flavor arrays. Return valid JSON only.'
          },
          {
            role: 'user',
            content: flavorsPrompt
          }
        ],
        max_tokens: 100,
        temperature: 0.8,
      }),
    })

    let newEffects = effects || []
    let newFlavors = flavors || []

    // Parse effects response
    if (effectsResponse.ok) {
      const effectsData = await effectsResponse.json()
      if (effectsData.choices && effectsData.choices[0] && effectsData.choices[0].message) {
        try {
          const effectsContent = effectsData.choices[0].message.content.trim()
          const parsedEffects = JSON.parse(effectsContent)
          if (Array.isArray(parsedEffects)) {
            newEffects = parsedEffects
            console.log('Generated new effects:', newEffects)
          }
        } catch (e) {
          console.log('Failed to parse effects, keeping original:', e)
        }
      }
    }

    // Parse flavors response
    if (flavorsResponse.ok) {
      const flavorsData = await flavorsResponse.json()
      if (flavorsData.choices && flavorsData.choices[0] && flavorsData.choices[0].message) {
        try {
          const flavorsContent = flavorsData.choices[0].message.content.trim()
          const parsedFlavors = JSON.parse(flavorsContent)
          if (Array.isArray(parsedFlavors)) {
            newFlavors = parsedFlavors
            console.log('Generated new flavors:', newFlavors)
          }
        } catch (e) {
          console.log('Failed to parse flavors, keeping original:', e)
        }
      }
    }

    console.log('Final regeneration result:', { 
      descriptionLength: description.length,
      effectsCount: newEffects.length,
      flavorsCount: newFlavors.length
    })

    return new Response(
      JSON.stringify({ 
        description,
        effects: newEffects,
        flavors: newFlavors
      }),
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


import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { validateStrainData, parseOpenAIResponse } from './validation.ts'
import { createOpenAIAnalysis } from './openai.ts'
import { getDeterministicTHCRange } from './thcGenerator.ts'
import { corsHeaders } from './cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageData, textQuery, userId } = await req.json()
    console.log('Analyze strain request:', { hasImage: !!imageData, textQuery, userId })

    // Initialize Supabase client if userId provided for saving
    let supabase = null
    if (userId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
      supabase = createClient(supabaseUrl, supabaseAnonKey)
    }

    // Validate inputs
    if (!imageData && !textQuery) {
      return new Response(
        JSON.stringify({ error: 'Either imageData or textQuery must be provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call OpenAI for analysis
    const analysisResult = await createOpenAIAnalysis(imageData, textQuery)
    console.log('OpenAI analysis result:', analysisResult)

    // Parse and validate the response
    const parsedData = parseOpenAIResponse(analysisResult, textQuery)
    const validatedStrain = validateStrainData(parsedData, textQuery, !!imageData)

    console.log('Validated strain data:', validatedStrain)

    // Generate deterministic THC to ensure consistency
    const [thcMin] = getDeterministicTHCRange(validatedStrain.name)
    validatedStrain.thc = thcMin

    // Convert to the expected response format
    const responseData = {
      name: validatedStrain.name,
      type: validatedStrain.type,
      thc: validatedStrain.thc,
      cbd: validatedStrain.cbd,
      effectProfiles: validatedStrain.effects.map((effect, index) => ({
        name: effect,
        intensity: Math.floor(Math.random() * 3) + 3, // 3-5 intensity
        emoji: getEffectEmoji(effect),
        color: getEffectColor(index)
      })),
      flavorProfiles: validatedStrain.flavors.map((flavor, index) => ({
        name: flavor,
        intensity: Math.floor(Math.random() * 3) + 2, // 2-4 intensity
        emoji: getFlavorEmoji(flavor),
        color: getFlavorColor(index)
      })),
      terpenes: validatedStrain.terpenes,
      description: validatedStrain.description,
      confidence: validatedStrain.confidence
    }

    // Save to database if userId provided
    if (supabase && userId) {
      try {
        const { error: insertError } = await supabase
          .from('scans')
          .insert({
            user_id: userId,
            strain_name: responseData.name,
            strain_type: responseData.type,
            thc: responseData.thc,
            cbd: responseData.cbd,
            effects: validatedStrain.effects,
            flavors: validatedStrain.flavors,
            terpenes: validatedStrain.terpenes,
            medical_uses: validatedStrain.medicalUses,
            description: responseData.description,
            confidence: responseData.confidence
          })

        if (insertError) {
          console.error('Error saving scan to database:', insertError)
        } else {
          console.log('Scan saved to database successfully')
        }
      } catch (dbError) {
        console.error('Database operation failed:', dbError)
      }
    }

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in analyze-strain function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        fallbackStrain: validateStrainData({}, undefined, false)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Helper functions for mapping effects and flavors to visual elements
function getEffectEmoji(effect: string): string {
  const emojiMap: { [key: string]: string } = {
    'relaxed': '😌', 'happy': '😊', 'euphoric': '🌟', 'uplifted': '⬆️',
    'creative': '🎨', 'focused': '🎯', 'energetic': '⚡', 'sleepy': '😴',
    'hungry': '🍕', 'giggly': '😂', 'talkative': '💬', 'aroused': '💘'
  }
  return emojiMap[effect.toLowerCase()] || '🌿'
}

function getFlavorEmoji(flavor: string): string {
  const emojiMap: { [key: string]: string } = {
    'earthy': '🌍', 'sweet': '🍯', 'citrus': '🍊', 'pine': '🌲',
    'diesel': '⛽', 'berry': '🫐', 'vanilla': '🍦', 'spicy': '🌶️',
    'mint': '🌿', 'cheese': '🧀', 'coffee': '☕', 'chocolate': '🍫'
  }
  return emojiMap[flavor.toLowerCase()] || '🌿'
}

function getEffectColor(index: number): string {
  const colors = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899', '#F97316', '#84CC16']
  return colors[index % colors.length]
}

function getFlavorColor(index: number): string {
  const colors = ['#78716C', '#F59E0B', '#22C55E', '#A855F7', '#06B6D4', '#F43F5E', '#FACC15', '#8B5A2B']
  return colors[index % colors.length]
}


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { imageData } = await req.json();
    
    if (!imageData) {
      throw new Error('No image data provided');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Analyzing cannabis package image with OpenAI Vision...');

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
            content: `You are an expert cannabis strain identifier. Analyze the cannabis package image and extract information to identify the strain. Look for:
            - Strain name on the package
            - THC and CBD percentages
            - Package text and labels
            - Visual characteristics of the product
            - Brand information
            
            Return a JSON object with this exact structure:
            {
              "name": "strain name",
              "type": "Indica" | "Sativa" | "Hybrid",
              "thc": number (0-100),
              "cbd": number (0-100),
              "effects": ["effect1", "effect2", ...],
              "flavors": ["flavor1", "flavor2", ...],
              "medicalUses": ["use1", "use2", ...],
              "description": "detailed description",
              "confidence": number (0-100)
            }
            
            Base your analysis on what you can see in the package. If information isn't clearly visible, use your knowledge of cannabis strains to provide educated estimates. Always provide realistic THC/CBD values and appropriate effects/flavors for the identified strain type.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this cannabis package image and identify the strain with all the requested details.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    console.log('Raw OpenAI response:', analysisText);

    // Parse the JSON response from OpenAI
    let strainData;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        strainData = JSON.parse(jsonMatch[0]);
      } else {
        strainData = JSON.parse(analysisText);
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      // Fallback with basic structure
      strainData = {
        name: "Unidentified Strain",
        type: "Hybrid",
        thc: 20,
        cbd: 1,
        effects: ["Relaxed", "Happy"],
        flavors: ["Earthy", "Sweet"],
        medicalUses: ["Pain Relief", "Stress"],
        description: "Unable to fully analyze the package image. Please try with a clearer image.",
        confidence: 25
      };
    }

    // Validate and sanitize the response
    const validatedStrain = {
      name: strainData.name || "Unknown Strain",
      type: ['Indica', 'Sativa', 'Hybrid'].includes(strainData.type) ? strainData.type : 'Hybrid',
      thc: Math.min(Math.max(Number(strainData.thc) || 20, 0), 100),
      cbd: Math.min(Math.max(Number(strainData.cbd) || 1, 0), 100),
      effects: Array.isArray(strainData.effects) ? strainData.effects.slice(0, 8) : ["Relaxed", "Happy"],
      flavors: Array.isArray(strainData.flavors) ? strainData.flavors.slice(0, 6) : ["Earthy"],
      medicalUses: Array.isArray(strainData.medicalUses) ? strainData.medicalUses.slice(0, 6) : ["General Wellness"],
      description: strainData.description || "Strain analysis completed using AI image recognition.",
      confidence: Math.min(Math.max(Number(strainData.confidence) || 75, 0), 100)
    };

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
        // Provide fallback data so the app doesn't break
        fallbackStrain: {
          name: "Analysis Error",
          type: "Hybrid",
          thc: 18,
          cbd: 2,
          effects: ["Unknown"],
          flavors: ["Unknown"],
          medicalUses: ["Consult Professional"],
          description: "Image analysis failed. Please try again with a clearer image.",
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


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    // Initialize Supabase client for caching
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    console.log('Analyzing with OpenAI Vision...', textQuery ? 'Text query mode' : 'Image mode');

    let messages;
    
    if (textQuery) {
      // Text-based generation with enhanced spelling/grammar correction
      messages = [
        {
          role: 'system',
          content: `You are an expert cannabis strain identifier and cannabis knowledge expert. The user has provided a strain name or description that may contain spelling errors or poor punctuation. 

          IMPORTANT TASKS:
          1. CORRECT SPELLING & GRAMMAR: Fix any spelling mistakes, punctuation errors, and grammatical issues in the provided text
          2. GENERATE COMPREHENSIVE DATA: Use your cannabis knowledge to create complete strain information
          
          For the corrected and cleaned strain name/description, provide realistic information:
          
          Cannabis Knowledge Guidelines:
          - Indica strains: typically 15-25% THC, 0-5% CBD, relaxing/sedating effects, earthy/sweet flavors
          - Sativa strains: typically 18-28% THC, 0-3% CBD, energizing/uplifting effects, citrus/pine flavors  
          - Hybrid strains: balanced effects combining both, THC 16-26%, variable CBD
          - Popular effects: Relaxed, Happy, Euphoric, Uplifted, Creative, Focused, Sleepy, Hungry
          - Common flavors: Earthy, Sweet, Citrus, Pine, Berry, Diesel, Skunk, Floral, Spicy
          - Major terpenes: Myrcene (sedating), Limonene (uplifting), Pinene (alertness), Linalool (calming), Caryophyllene (anti-inflammatory), Terpinolene (piney), Humulene (appetite suppressant)
          - Medical uses: Pain Relief, Stress Relief, Anxiety, Insomnia, Depression, Appetite Loss, Nausea
          
          Return a JSON object with this exact structure:
          {
            "name": "corrected and properly formatted strain name",
            "type": "Indica" | "Sativa" | "Hybrid",
            "thc": number (realistic for strain type),
            "cbd": number (realistic for strain type), 
            "effects": ["effect1", "effect2", ...] (3-6 effects appropriate for type),
            "flavors": ["flavor1", "flavor2", ...] (2-4 flavors typical for strain),
            "terpenes": [
              {"name": "terpene_name", "percentage": number, "effects": "description of effects"},
              ...
            ] (3-6 major terpenes with realistic percentages 0.1-3.0%),
            "medicalUses": ["use1", "use2", ...] (3-5 medical applications),
            "description": "detailed description with corrected spelling/grammar, strain background, effects, and usage notes",
            "confidence": number (85 for text-generated strains)
          }
          
          Always provide complete, realistic information with proper spelling and grammar.`
        },
        {
          role: 'user',
          content: `Please analyze and correct this strain name/description, then generate complete strain information: "${textQuery}"`
        }
      ];
    } else {
      // Image-based analysis (existing logic)
      messages = [
        {
          role: 'system',
          content: `You are an expert cannabis strain identifier and cannabis knowledge expert. Analyze the cannabis package image and extract information to identify the strain. 

          IMPORTANT: Use your extensive cannabis knowledge to fill in ANY missing information intelligently:
          
          Look for visible information:
          - Strain name on the package
          - THC and CBD percentages
          - Package text and labels
          - Visual characteristics of the product
          - Brand information
          
          For missing information, use your cannabis knowledge to provide:
          - Realistic THC/CBD ranges for the strain type
          - Appropriate effects based on Indica/Sativa/Hybrid classification
          - Common flavors for the identified or similar strains
          - Detailed terpene profiles with percentages
          - Relevant medical uses based on cannabinoid profile
          - Detailed strain description with background information
          
          Cannabis Knowledge Guidelines:
          - Indica strains: typically 15-25% THC, 0-5% CBD, relaxing/sedating effects, earthy/sweet flavors
          - Sativa strains: typically 18-28% THC, 0-3% CBD, energizing/uplifting effects, citrus/pine flavors  
          - Hybrid strains: balanced effects combining both, THC 16-26%, variable CBD
          - Popular effects: Relaxed, Happy, Euphoric, Uplifted, Creative, Focused, Sleepy, Hungry
          - Common flavors: Earthy, Sweet, Citrus, Pine, Berry, Diesel, Skunk, Floral, Spicy
          - Major terpenes: Myrcene (sedating), Limonene (uplifting), Pinene (alertness), Linalool (calming), Caryophyllene (anti-inflammatory), Terpinolene (piney), Humulene (appetite suppressant)
          - Medical uses: Pain Relief, Stress Relief, Anxiety, Insomnia, Depression, Appetite Loss, Nausea
          
          Return a JSON object with this exact structure:
          {
            "name": "strain name (if not visible, provide educated guess based on appearance)",
            "type": "Indica" | "Sativa" | "Hybrid",
            "thc": number (0-35, realistic for strain type),
            "cbd": number (0-25, realistic for strain type), 
            "effects": ["effect1", "effect2", ...] (3-6 effects appropriate for type),
            "flavors": ["flavor1", "flavor2", ...] (2-4 flavors typical for strain),
            "terpenes": [
              {"name": "terpene_name", "percentage": number, "effects": "description of effects"},
              ...
            ] (3-6 major terpenes with realistic percentages 0.1-3.0%),
            "medicalUses": ["use1", "use2", ...] (3-5 medical applications),
            "description": "detailed description with strain background, effects, and usage notes",
            "confidence": number (0-100, based on visible package information clarity)
          }
          
          Always provide complete, realistic information even if the package is unclear. Use your cannabis expertise to generate appropriate values.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please analyze this cannabis package image and identify the strain with all the requested details including detailed terpene profiles. Use your cannabis knowledge to fill in any missing information intelligently.'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageData
              }
            }
          ]
        }
      ];
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 1500,
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
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        strainData = JSON.parse(jsonMatch[0]);
      } else {
        strainData = JSON.parse(analysisText);
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      // Enhanced fallback with cannabis knowledge including terpenes
      strainData = {
        name: textQuery ? textQuery.replace(/[^\w\s]/g, '').trim() : "Mystery Hybrid",
        type: "Hybrid",
        thc: 20,
        cbd: 2,
        effects: ["Relaxed", "Happy", "Euphoric", "Creative"],
        flavors: ["Earthy", "Sweet", "Pine"],
        terpenes: [
          {"name": "Myrcene", "percentage": 1.2, "effects": "Sedating and relaxing"},
          {"name": "Limonene", "percentage": 0.8, "effects": "Uplifting and stress-relieving"},
          {"name": "Pinene", "percentage": 0.6, "effects": "Alertness and memory retention"}
        ],
        medicalUses: ["Pain Relief", "Stress Relief", "Anxiety", "Insomnia"],
        description: "A balanced hybrid strain with moderate THC levels. This strain typically provides a well-rounded experience combining relaxation with mental clarity. The earthy and sweet flavor profile makes it appealing to many users, while its therapeutic properties make it suitable for various medical applications including pain and stress management.",
        confidence: textQuery ? 85 : 25
      };
    }

    // Validate and enhance the response
    const validatedStrain = {
      name: strainData.name || (textQuery ? textQuery.replace(/[^\w\s]/g, '').trim() : "Unknown Strain"),
      type: ['Indica', 'Sativa', 'Hybrid'].includes(strainData.type) ? strainData.type : 'Hybrid',
      thc: Math.min(Math.max(Number(strainData.thc) || 20, 0), 35),
      cbd: Math.min(Math.max(Number(strainData.cbd) || 1, 0), 25),
      effects: Array.isArray(strainData.effects) ? strainData.effects.slice(0, 8) : ["Relaxed", "Happy", "Euphoric"],
      flavors: Array.isArray(strainData.flavors) ? strainData.flavors.slice(0, 6) : ["Earthy", "Sweet"],
      terpenes: Array.isArray(strainData.terpenes) ? strainData.terpenes.slice(0, 6) : [
        {"name": "Myrcene", "percentage": 1.0, "effects": "Relaxing and sedating"},
        {"name": "Limonene", "percentage": 0.7, "effects": "Mood elevation and stress relief"}
      ],
      medicalUses: Array.isArray(strainData.medicalUses) ? strainData.medicalUses.slice(0, 6) : ["Pain Relief", "Stress Relief"],
      description: strainData.description || "AI-analyzed cannabis strain with balanced effects and therapeutic potential.",
      confidence: Math.min(Math.max(Number(strainData.confidence) || (textQuery ? 85 : 75), 0), 100)
    };

    // Try to cache the strain analysis for future reference
    try {
      const cacheKey = `strain_${validatedStrain.name.toLowerCase().replace(/\s+/g, '_')}`;
      await supabase
        .from('strain_cache')
        .upsert({
          cache_key: cacheKey,
          strain_data: validatedStrain,
          created_at: new Date().toISOString()
        }, { onConflict: 'cache_key' });
      
      console.log('Strain cached successfully:', cacheKey);
    } catch (cacheError) {
      console.log('Cache error (non-critical):', cacheError);
      // Don't fail the request if caching fails
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

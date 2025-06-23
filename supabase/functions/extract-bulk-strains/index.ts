
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, content } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let messages;
    
    if (type === 'text') {
      messages = [
        {
          role: 'system',
          content: `You are an expert cannabis strain identifier. Extract cannabis strain names from the provided text, which may include:
          - Lists of strain names
          - Menu items with prices
          - Transcribed speech about strains
          - Dispensary inventory lists
          
          For each strain found, extract:
          - name (required): Clean, properly formatted strain name
          - price (optional): Any price information found (as number)
          - type (optional): Strain type if mentioned (indica/sativa/hybrid)
          
          Return a JSON object with this exact structure:
          {
            "strains": [
              {
                "name": "strain name",
                "price": 25.99,
                "type": "indica"
              }
            ],
            "confidence": 85
          }
          
          Guidelines:
          - Clean up spelling errors and formatting
          - Remove any non-strain text (like "menu", "available", etc.)
          - If price is mentioned per gram/eighth/etc, extract the number only
          - Only include type if clearly stated
          - Confidence should reflect how certain you are about the extraction`
        },
        {
          role: 'user',
          content: `Extract strain information from this text: "${content}"`
        }
      ];
    } else if (type === 'image') {
      messages = [
        {
          role: 'system',
          content: `You are an expert cannabis strain identifier. Analyze this image which may contain:
          - Dispensary menus
          - Strain lists
          - Product labels
          - Inventory sheets
          
          Extract cannabis strain names and any associated information:
          - name (required): Clean, properly formatted strain name
          - price (optional): Any price information visible
          - type (optional): Strain type if mentioned (indica/sativa/hybrid)
          
          Return a JSON object with this exact structure:
          {
            "strains": [
              {
                "name": "strain name",
                "price": 25.99,
                "type": "indica"
              }
            ],
            "confidence": 85
          }
          
          Guidelines:
          - Focus on readable text in the image
          - Clean up any OCR errors
          - Extract prices as numbers only
          - Only include type if clearly visible
          - Confidence should reflect image clarity and text readability`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract strain information from this image:'
            },
            {
              type: 'image_url',
              image_url: {
                url: content
              }
            }
          ]
        }
      ];
    } else {
      throw new Error('Invalid extraction type. Must be "text" or "image"');
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
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const extractedData = JSON.parse(result.choices[0].message.content);

    return new Response(JSON.stringify(extractedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-bulk-strains function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        strains: [],
        confidence: 0
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

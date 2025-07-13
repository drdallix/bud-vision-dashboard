import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');

interface StrainAnalysisResult {
  id: string;
  name: string;
  type: 'indica' | 'sativa' | 'hybrid';
  thc: number;
  cbd: number;
  effects: string[];
  flavors: string[];
  medicalUses: string[];
  terpenes: Record<string, number>;
  description: string;
  confidence: number;
}

const analyzeStrainFromText = async (detectedText: string): Promise<StrainAnalysisResult | null> => {
  if (!PERPLEXITY_API_KEY) {
    throw new Error('Perplexity API key not configured');
  }

  const cleanText = detectedText.trim();
  if (cleanText.length < 3) {
    return null;
  }

  const prompt = `Analyze this cannabis strain text from a dispensary package: "${cleanText}"

Extract the strain name and provide comprehensive strain information. If the text doesn't clearly contain a cannabis strain name, return null.

Respond in this exact JSON format:
{
  "name": "strain_name",
  "type": "indica|sativa|hybrid",
  "thc": number_between_15_30,
  "cbd": number_between_0_5,
  "effects": ["relaxed", "euphoric", "happy", "focused", "creative"],
  "flavors": ["earthy", "citrus", "pine", "sweet", "diesel"],
  "medicalUses": ["anxiety", "pain", "insomnia", "stress", "depression"],
  "terpenes": {"myrcene": 0.8, "limonene": 0.6, "pinene": 0.4, "caryophyllene": 0.3},
  "description": "detailed_description",
  "confidence": number_between_0_100
}

Only respond with valid JSON. If no strain is detected, respond with: {"confidence": 0}`;

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a cannabis strain identification expert. Return only valid JSON responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return null;
    }

    try {
      const result = JSON.parse(content);
      
      if (result.confidence === 0 || !result.name) {
        return null;
      }

      return {
        id: Date.now().toString(),
        ...result
      };
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Perplexity API error:', error);
    return null;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { detectedText } = await req.json();

    if (!detectedText || typeof detectedText !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid detected text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await analyzeStrainFromText(detectedText);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in OCR strain analysis:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
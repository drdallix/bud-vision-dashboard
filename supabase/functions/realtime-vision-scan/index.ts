import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface StreamingResponse {
  type: 'progress' | 'detection' | 'generation' | 'complete' | 'error';
  phase?: string;
  message?: string;
  confidence?: number;
  strainName?: string;
  duplicate?: boolean;
  strain?: any;
  error?: string;
}

const analyzeImageWithVision = async (imageBase64: string): Promise<{name: string, confidence: number}> => {
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
          content: `You are an expert at identifying cannabis strain names from product packaging. 
          Analyze the image and extract ONLY the strain name. Look for:
          - Product labels
          - Strain names on packages
          - Brand names that might be strain names
          
          Return ONLY a JSON object in this format:
          {"name": "strain_name", "confidence": number_0_to_100}
          
          If no clear strain name is visible, return: {"name": "", "confidence": 0}`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'What cannabis strain name do you see in this image?'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 300,
      temperature: 0.1
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI Vision API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const result = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
    return {
      name: result.name || '',
      confidence: result.confidence || 0
    };
  } catch {
    return { name: '', confidence: 0 };
  }
};

const checkForDuplicateStrain = async (strainName: string, userId: string): Promise<{exists: boolean, strain?: any}> => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', userId)
    .ilike('strain_name', `%${strainName}%`)
    .limit(1);

  if (error) {
    console.error('Error checking for duplicates:', error);
    return { exists: false };
  }

  return {
    exists: data && data.length > 0,
    strain: data?.[0] || null
  };
};

const generateStrainProfile = async (strainName: string, userId: string): Promise<any> => {
  const response = await fetch(`${supabaseUrl}/functions/v1/analyze-strain`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      textQuery: strainName,
      userId: userId
    }),
  });

  if (!response.ok) {
    throw new Error(`Strain generation failed: ${response.status}`);
  }

  return await response.json();
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { searchParams } = new URL(req.url);
  const isStreamRequest = searchParams.get('stream') === 'true';

  if (isStreamRequest) {
    // Handle streaming WebSocket connection
    if (req.headers.get("upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 400 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);
    
    socket.onopen = () => {
      console.log('WebSocket connection opened for realtime scan');
    };

    socket.onmessage = async (event) => {
      try {
        const { imageFrames, userId } = JSON.parse(event.data);
        
        if (!openAIApiKey) {
          socket.send(JSON.stringify({
            type: 'error',
            error: 'OpenAI API key not configured'
          }));
          return;
        }

        if (!userId) {
          socket.send(JSON.stringify({
            type: 'error',
            error: 'User authentication required'
          }));
          return;
        }

        // Phase 1: Burst analysis
        socket.send(JSON.stringify({
          type: 'progress',
          phase: 'capture',
          message: 'Analyzing captured frames...'
        }));

        let bestDetection = { name: '', confidence: 0 };
        
        // Process multiple frames for best results
        for (let i = 0; i < imageFrames.length; i++) {
          socket.send(JSON.stringify({
            type: 'progress',
            phase: 'analysis',
            message: `Processing frame ${i + 1}/${imageFrames.length}...`
          }));

          try {
            const detection = await analyzeImageWithVision(imageFrames[i]);
            if (detection.confidence > bestDetection.confidence) {
              bestDetection = detection;
            }
          } catch (error) {
            console.error(`Frame ${i + 1} analysis failed:`, error);
          }
        }

        if (!bestDetection.name || bestDetection.confidence < 30) {
          socket.send(JSON.stringify({
            type: 'error',
            error: 'No strain name detected in images'
          }));
          return;
        }

        // Phase 2: Detection confirmation
        socket.send(JSON.stringify({
          type: 'detection',
          strainName: bestDetection.name,
          confidence: bestDetection.confidence,
          message: `Strain detected: ${bestDetection.name}`
        }));

        // Phase 3: Check for duplicates
        socket.send(JSON.stringify({
          type: 'progress',
          phase: 'duplicate_check',
          message: 'Checking for existing strain...'
        }));

        const duplicateCheck = await checkForDuplicateStrain(bestDetection.name, userId);
        
        if (duplicateCheck.exists) {
          socket.send(JSON.stringify({
            type: 'complete',
            duplicate: true,
            strain: duplicateCheck.strain,
            message: 'Strain already exists in your collection'
          }));
          return;
        }

        // Phase 4: Generate new strain profile
        socket.send(JSON.stringify({
          type: 'generation',
          phase: 'ai_generation',
          message: 'Generating comprehensive strain profile...'
        }));

        const generatedStrain = await generateStrainProfile(bestDetection.name, userId);

        socket.send(JSON.stringify({
          type: 'complete',
          duplicate: false,
          strain: generatedStrain,
          message: 'New strain profile generated successfully'
        }));

      } catch (error) {
        console.error('Realtime scan error:', error);
        socket.send(JSON.stringify({
          type: 'error',
          error: error.message
        }));
      }
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return response;
  }

  // Handle regular HTTP requests (fallback)
  try {
    const { imageFrames, userId } = await req.json();
    
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Process frames quickly for best detection
    let bestDetection = { name: '', confidence: 0 };
    
    for (const frame of imageFrames) {
      try {
        const detection = await analyzeImageWithVision(frame);
        if (detection.confidence > bestDetection.confidence) {
          bestDetection = detection;
        }
      } catch (error) {
        console.error('Frame analysis failed:', error);
      }
    }

    if (!bestDetection.name || bestDetection.confidence < 30) {
      return new Response(JSON.stringify({ 
        error: 'No strain detected in images',
        confidence: bestDetection.confidence
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check for duplicates
    const duplicateCheck = await checkForDuplicateStrain(bestDetection.name, userId);
    
    if (duplicateCheck.exists) {
      return new Response(JSON.stringify({
        duplicate: true,
        strain: duplicateCheck.strain
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate new strain
    const generatedStrain = await generateStrainProfile(bestDetection.name, userId);

    return new Response(JSON.stringify({
      duplicate: false,
      strain: generatedStrain
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('HTTP scan error:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
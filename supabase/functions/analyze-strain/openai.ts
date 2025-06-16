
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

export const createOpenAIAnalysis = async (imageData?: string, textQuery?: string) => {
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  let messages = [];
  
  if (imageData && textQuery) {
    messages = [
      {
        role: "system",
        content: "You are a cannabis expert AI that analyzes cannabis strains from images and text descriptions. Return detailed strain information in JSON format."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this cannabis strain image and text query: "${textQuery}". Provide detailed information about the strain including name, type (Indica/Sativa/Hybrid), THC/CBD levels, effects, flavors, terpenes, medical uses, and description.`
          },
          {
            type: "image_url",
            image_url: {
              url: imageData
            }
          }
        ]
      }
    ];
  } else if (imageData) {
    messages = [
      {
        role: "system",
        content: "You are a cannabis expert AI that analyzes cannabis strains from images. Return detailed strain information in JSON format."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this cannabis strain image. Provide detailed information about the strain including name, type (Indica/Sativa/Hybrid), THC/CBD levels, effects, flavors, terpenes, medical uses, and description."
          },
          {
            type: "image_url",
            image_url: {
              url: imageData
            }
          }
        ]
      }
    ];
  } else if (textQuery) {
    messages = [
      {
        role: "system",
        content: "You are a cannabis expert AI that provides detailed strain information. Return information in JSON format."
      },
      {
        role: "user",
        content: `Provide detailed information about the cannabis strain: "${textQuery}". Include name, type (Indica/Sativa/Hybrid), THC/CBD levels, effects, flavors, terpenes, medical uses, and description. Format as JSON: {"name": "strain name", "type": "Indica/Sativa/Hybrid", "thc": number, "cbd": number, "effects": ["effect1", "effect2"], "flavors": ["flavor1", "flavor2"], "terpenes": [{"name": "terpene", "percentage": number, "effects": "description"}], "medicalUses": ["use1", "use2"], "description": "detailed description", "confidence": number}`
      }
    ];
  } else {
    throw new Error('Either imageData or textQuery must be provided');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: imageData ? 'gpt-4o' : 'gpt-4o-mini',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('OpenAI response received:', data);

  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response from OpenAI API');
  }

  return data.choices[0].message.content.trim();
};

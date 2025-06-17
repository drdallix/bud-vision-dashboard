export interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant' | 'function';
    content?: string;
    name?: string;
    function_call?: { name: string; arguments: string };
}

export const supportedEffectsList = "Relaxed, Happy, Euphoric, Uplifted, Creative, Focused, Sleepy, Hungry";
export const supportedFlavorsList = "Earthy, Sweet, Citrus, Pine, Berry, Diesel, Skunk, Floral";

export const return_strain_profile = {
    name: "return_strain_profile",
    description: "Generate a cannabis strain profile based on the input query.",
    parameters: {
        type: "object",
        properties: {
            name: { type: "string" },
            type: { type: "string", enum: ["Indica", "Indica-Dominant", "Hybrid", "Sativa-Dominant", "Sativa"] },
            thc: { type: "number" },
            cbd: { type: "number" },
            effects: { type: "array", items: { type: "string", enum: supportedEffectsList.split(", ") } },
            flavors: { type: "array", items: { type: "string", enum: supportedFlavorsList.split(", ") } },
            description: { type: "string" },
            confidence: { type: "number" },
        },
        required: ["name", "type", "thc", "cbd", "effects", "flavors", "description", "confidence"]
    }
};

export interface StrainProfile {
    name: string;
    type: "Indica" | "Indica-Dominant" | "Hybrid" | "Sativa-Dominant" | "Sativa";
    thc: number;
    cbd: number;
    effects: string[];
    flavors: string[];
    description: string;
    confidence: number;
}

export function createTextAnalysisMessages(textQuery: string, thcRangeHint?: [number, number]): OpenAIMessage[] {
    const examples: StrainProfile[] = [
        {
            name: "Blue Dream",
            type: "Sativa-Dominant",
            thc: 18,
            cbd: 0.1,
            effects: ["Euphoric", "Creative", "Relaxed"],
            flavors: ["Berry", "Sweet"],
            description: "Blue Dream is a classic Californian sativa-dominant hybrid known for its balanced full-body relaxation and gentle cerebral invigoration. It delivers a sweet berry flavor with earthy undertones and a euphoric, creative but calm experience. Sources used to generate this description include published strain reviews, breeder notes.",
            confidence: 0.92
        },
        {
            name: "Girl Scout Cookies",
            type: "Hybrid",
            thc: 20,
            cbd: 0.1,
            effects: ["Happy", "Uplifted", "Creative"],
            flavors: ["Sweet", "Earthy", "Citrus"],
            description: "Girl Scout Cookies (GSC) is a potent hybrid from California’s Emerald Triangle, praised for its euphoric happiness and creativity. It combines sweet, earthy, and citrus flavors with a powerful yet balanced high. Sources used to generate this description include cannabis cup reports, breeder profiles.",
            confidence: 0.89
        },
        {
            name: "OG Kush",
            type: "Hybrid",
            thc: 22,
            cbd: 0.2,
            effects: ["Relaxed", "Hungry", "Happy"],
            flavors: ["Earthy", "Diesel", "Pine"],
            description: "OG Kush is a legendary West Coast hybrid famous for its heavy, euphoric relaxation and appetite-boosting effects. It offers a complex aroma with earthy, diesel, and pine notes. Sources used to generate this description include dispensary terpene data, historical strain articles.",
            confidence: 0.95
        },
        {
            name: "Sour Diesel",
            type: "Sativa-Dominant",
            thc: 19,
            cbd: 0.1,
            effects: ["Euphoric", "Creative", "Uplifted"],
            flavors: ["Diesel", "Citrus", "Skunk"],
            description: "Sour Diesel is a fast-acting sativa famed for its energizing and creative high. Its pungent diesel aroma, with citrus and skunk undertones, provides an uplifting cerebral experience. Sources used to generate this description include reputable strain guides, consumer reviews.",
            confidence: 0.93
        },
        {
            name: "Granddaddy Purple",
            type: "Indica",
            thc: 17,
            cbd: 0.3,
            effects: ["Relaxed", "Sleepy", "Hungry"],
            flavors: ["Berry", "Sweet", "Earthy"],
            description: "Granddaddy Purple (GDP) is an iconic indica from California, noted for its deep body relaxation, sleep promotion, and appetite stimulation. It features sweet berry and earthy flavors. Sources used to generate this description include cannabis award summaries, grower testimonials.",
            confidence: 0. ninety
        }
    ];

    const systemLines = [
        "You are a system that generates cannabis strain profiles in structured JSON.",
        `Use only effects from: ${supportedEffectsList}.`,
        `Use only flavors from: ${supportedFlavorsList}.`,
        "THC should be set to " + (thcRangeHint ? thcRangeHint[0] : 21) + ".",
        "Descriptions must end with: “Sources used to generate this description include X[, Y].”",
        "Here are sample strain profiles to match stylistic and factual diversity:"
    ];
    for (const ex of examples) systemLines.push(JSON.stringify(ex));
    systemLines.push("Each sample references a well-documented strain or source.");

    return [
        { role: 'system', content: systemLines.join("\n") },
        { role: 'user', content: `Please analyze and generate a factually accurate profile for: "${textQuery}".` }
    ];
}

export async function callOpenAI(messages: OpenAIMessage[], apiKey: string): Promise<StrainProfile> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages,
            functions: [return_strain_profile],
            function_call: { name: "return_strain_profile" },
            max_tokens: 1500,
            temperature: 0
        })
    });

    if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
    const json = await res.json();
    const msg = json.choices?.[0]?.message;
    if (!msg?.function_call?.arguments) throw new Error("No function call response");
    return JSON.parse(msg.function_call.arguments);
}

"use server";

import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export async function generateCoachingResponse(userQuery: string) {
    // 1. MOCK MODE (Fallout if no URL configured)
    const HF_SPACE_URL = process.env.HF_SPACE_URL || "https://makitodev-makito.hf.space";

    // Simple check if URL is valid/present
    if (!HF_SPACE_URL && !process.env.OPENAI_API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        return "🤖 [MOCK MODE] Makito Workout here! Since no API Key is configured. \n\n" +
            "To get real AI advice, configure HF_SPACE_URL or OPENAI_API_KEY in .env.local.";
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Fetch user profile for context
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

    const systemPrompt = `
    You are Makito Workout, a highly motivating and technically expert fitness assistant.
    User Context: ${profile?.subscription_tier === 'premium' ? 'Premium User' : 'Free User'}.
    
    Guidelines:
    1. Be concise, energetic, and professional.
    2. Focus on biomechanics and safety for exercise questions.
    3. For nutrition, suggest whole foods and balanced macros.
    4. If the user is Free tier, remind them occasionally about Premium features for advanced video analysis.
  `;

    try {
        // Support for standard OpenAI IF key is present (fallback)
        if (process.env.OPENAI_API_KEY && !process.env.HF_SPACE_URL) {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userQuery },
                ],
                model: "gpt-3.5-turbo",
            });
            return completion.choices[0].message.content;
        }

        // STRATEGY: Use OpenAI Client with Custom HF Endpoint
        // We confirmed via testing that the model name is 'Makito:latest' or 'qwen2.5-coder:7b'
        console.log("Using Custom HF Endpoint:", HF_SPACE_URL);

        const customClient = new OpenAI({
            baseURL: `${HF_SPACE_URL}/v1`,
            apiKey: process.env.HF_ACCESS_TOKEN || "start-token",
        });

        try {
            const completion = await customClient.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userQuery }
                ],
                model: "Makito:latest", // Confirmed via test script
                max_tokens: 500,
            });

            return completion.choices[0].message.content || "Empty response from Custom Model.";

        } catch (apiError) {
            console.error("Custom AI API Error:", apiError);

            // Fallback to second model name if first fails
            try {
                const retryCompletion = await customClient.chat.completions.create({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userQuery }
                    ],
                    model: "qwen2.5-coder:7b", // Fallback model name
                    max_tokens: 500,
                });
                return retryCompletion.choices[0].message.content || "Empty response from Backup Model.";
            } catch (retryError) {
                return `⚠️ AI Error: ${(apiError as Error).message}. Check Space URL & Token.`;
            }
        }

    } catch (error) {
        console.error("AI Service Error:", error);
        return `⚠️ Error Interno: ${error instanceof Error ? error.message : "Error desconocido"}. Revisa consola.`;
    }
}

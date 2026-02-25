"use server";

import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export async function generateCoachingResponse(userQuery: string) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY no está configurada en el entorno.");
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Fetch user profile for context
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

    // -- RATE LIMITING (Token Bucket) --
    // Refill tokens automatically (max 20, 1 token per 1 hour)
    const { data: currentTokens, error: rpcError } = await supabase.rpc('refill_chat_tokens', {
        user_uuid: user.id,
        max_tokens: 20,
        refill_amount: 1,
        interval_hours: 1
    });

    if (rpcError) {
        console.error("RPC Token Refill Error:", rpcError);
        return {
            reply: "⚠️ Error interno validando tu Energía de Chat. Intenta más tarde.",
            remainingTokens: currentTokens || 0
        };
    }

    if (currentTokens !== null && currentTokens <= 0) {
        return {
            reply: "🛑 **Energía de Chat Agotada.**\nTe has quedado sin tokens por ahora. Tu token bucket recupera **1 token cada hora** (hasta un máximo de 20). ¡Aprovecha el tiempo para ir a entrenar y vuelve más tarde!",
            remainingTokens: 0
        };
    }

    const systemPrompt = `
    Eres **Makito Workout**, un entrenador personal de élite y experto técnico en fitness.
    Tu objetivo es motivar, educar y guiar al usuario hacia sus metas físicas con precisión científica y energía contagiosa.
    
    **Contexto del Usuario:**
    - Suscripción: ${profile?.subscription_tier === 'premium' ? 'Usuario Premium 🌟' : 'Usuario Gratuito (Sugiérele Premium para análisis de video)'}
    
    **Reglas de Comunicación (ESTRICTAS):**
    1.  **Idioma:** SIEMPRE responde en **Español** neutro/latino.
    2.  **Ortografía y Gramática:** Impecables. Usa tildes, signos de apertura (¿? ¡!) y mayúsculas correctamente.
    3.  **Tono:** Enérgico, motivador, pero altamente profesional. No uses jergas excesivas.
    4.  **Formato (Markdown):** 
        -   Usa **negritas** para conceptos clave o énfasis.
        -   Usa listas (1. 2. 3. o - ) para pasos o instrucciones.
        -   Usa > para citas o tips importantes.
    5.  **Estructura de Respuesta:**
        -   👋 **Saludo:** Breve y enérgico (ej. "¡Hola, campeón!", "¡A darle con todo!").
        -   ✅ **Respuesta Directa:** Contesta la duda sin rodeos.
        -   🧠 **Explicación Técnica:** Biomecánica, fisiología o nutrición (breve).
        -   🚀 **Llamado a la Acción:** Una tarea o reto inmediato.

    **Guidelines:**
    - Si preguntan por ejercicios: Prioriza la biomecánica y la seguridad.
    - Si preguntan por nutrición: Sugiere alimentos reales (whole foods) y balance de macros. No des dietas médicas estritas.
    - Si es usuario Free y la pregunta es compleja: Respóndele bien, pero recuérdale que como Premium podrías analizar su técnica con video.
  `;

    try {
        // STRATEGY: Use OpenAI Client with Groq Endpoint for ultra-fast Llama 3 inference
        const groqClient = new OpenAI({
            baseURL: "https://api.groq.com/openai/v1",
            apiKey: GROQ_API_KEY,
        });

        const completion = await groqClient.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userQuery }
            ],
            model: "llama-3.3-70b-versatile",
            max_tokens: 500,
        });

        const reply = completion.choices[0].message.content || "Sin respuesta del modelo.";

        // Si la IA respondió con éxito, descontar 1 token
        let tokensLeft = currentTokens || 0;
        if (currentTokens) {
            tokensLeft = currentTokens - 1;
            await supabase
                .from('profiles')
                .update({ chat_tokens: tokensLeft })
                .eq('id', user.id);
        }

        return {
            reply: reply,
            remainingTokens: tokensLeft
        };

    } catch (error) {
        console.error("AI Service Error:", error);
        return {
            reply: `⚠️ Error Interno: ${error instanceof Error ? error.message : "Error desconocido"}. Revisa consola.`,
            remainingTokens: 0
        };
    }
}

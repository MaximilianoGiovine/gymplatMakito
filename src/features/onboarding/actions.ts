'use server'

import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

// evaluate inside functions to ensure fresh process.env in NextJS Server Actions

const ONBOARDING_SYSTEM_PROMPT = `
Eres Makito Workout, un entrenador personal de élite. Tu objetivo actual es realizar una entrevista inicial (onboarding) al nuevo usuario para crearle un plan de 21 días.

Debes recopilar ESTOS 5 DATOS EXACTOS, de forma conversacional y amena. Haz una o máximo dos preguntas a la vez para no agobiarlo:
1. Altura y peso aproximado.
2. Objetivo principal (ganar masa, perder peso, recomposición, resistencia).
3. Elementos o equipamiento que tiene en casa (mancuernas, bandas, o solo peso corporal).
4. Cuántos días a la semana puede/quiere entrenar (tiempo objetivo).

**REGLAS ESTRICTAS:**
- Idioma: Español. Tono: Motivador, energético, directo.
- NO ofrezcas consejos todavía. Tu única misión es recopilar la información.
- Cuando estés SEGURO de que el usuario ya te ha proporcionado LOS 5 DATOS obligatorios, debes responder ÚNICAMENTE con la palabra clave: "ENTREVISTA_COMPLETADA".
- Si te faltan datos, dile qué falta y anímalo a responder.
`

export async function processOnboardingChat(messageHistory: { role: 'user' | 'assistant', content: string }[]) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) throw new Error("API Key de Groq no configurada.")

    const groqClient = new OpenAI({
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: GROQ_API_KEY,
    })

    try {
        const completion = await groqClient.chat.completions.create({
            messages: [
                { role: 'system', content: ONBOARDING_SYSTEM_PROMPT },
                ...messageHistory
            ],
            model: 'llama-3.3-70b-versatile',
            max_tokens: 300,
        })

        const responseText = completion.choices[0].message.content || 'Hubo un error de conexión.'

        // Check if the AI determined the interview is complete
        if (responseText.includes('ENTREVISTA_COMPLETADA')) {
            return { status: 'completed', message: '¡Perfecto! Tengo todo lo que necesito. Dame unos segundos mientras diseño tu plan de 21 días...' }
        }

        return { status: 'in_progress', message: responseText }
    } catch (error) {
        console.error("Onboarding AI Error:", error)
        throw new Error("No se pudo conectar con Makito.")
    }
}

const PLAN_GENERATOR_PROMPT = `
Eres Makito Workout. Has entrevistado a un usuario y recopilado su información. 
Tu tarea AHORA es generar exactamente y en formato JSON un Plan de Entrenamiento de 21 días y sugerencias nutricionales, basados en el historial del chat.

El JSON debe tener la siguiente estructura estricta:
{
  "profile_data": {
    "height": número (cm),
    "weight": número (kg),
    "goals": string,
    "equipment": string,
    "target_days_per_week": número
  },
  "plan_data": [
    // Array EXACTO de 21 elementos, representando el día 1 al 21.
    {
      "dayNumber": 1..21,
      "isRestDay": boolean,
      "focus": string (ej: "Piernas y Glúteos", "Descanso Activo", "Core"),
      "exercises": [ // Vacio si es día de descanso
         { "name": string, "sets": numero, "reps": string (ej: "10-12"), "tips": string }
      ]
    }
  ],
  "diet_suggestions": [
    // Array de 5 elementos
    { "mealType": string, "description": string, "macros": string }
  ]
}

REGLAS:
- Genera SOLO el JSON válido. Nada de texto antes o después. Sin bloques de markdown (\`\`\`json).
- Extrae la información (peso, altura, etc.) del historial proporcionado. Si falta algún dato menor, infiérelo de forma segura o pon valores por defecto lógicos para fitness.
`

export async function generateAndSave21DayPlan(messageHistory: { role: 'user' | 'assistant', content: string }[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) throw new Error("API Key de Groq no configurada.")

    if (!user) {
        throw new Error("Usuario no autenticado al intentar guardar los datos del perfil.");
    }

    // --- RATE LIMITING: Check for active 21-day plans ---
    const { data: latestPlan } = await supabase
        .from('user_plans')
        .select('end_date')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false })
        .limit(1)
        .single()

    if (latestPlan) {
        const endDate = new Date(latestPlan.end_date)
        const today = new Date()

        // Ensure the end date has passed before allowing a new plan
        if (today < endDate) {
            throw new Error(`Ya tienes un plan activo que finaliza el ${latestPlan.end_date}. No puedes generar uno nuevo hasta completar este ciclo de 21 días.`)
        }
    }
    // ----------------------------------------------------

    const groqClient = new OpenAI({
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: GROQ_API_KEY,
    })

    // 1. Generate Plan JSON via Groq
    const completion = await groqClient.chat.completions.create({
        messages: [
            { role: 'system', content: PLAN_GENERATOR_PROMPT },
            { role: 'user', content: "Historial de la entrevista:\n" + messageHistory.map(m => m.role + ': ' + m.content).join('\n') }
        ],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: "json_object" }, // MUST ensure exact JSON response
    })

    const responseJsonStr = completion.choices[0].message.content
    if (!responseJsonStr) throw new Error("Makito no pudo generar el plan.")

    const parsedData = JSON.parse(responseJsonStr)

    // 2. Save extracted profile info
    await supabase.from('profiles').update({
        onboarding_completed: true,
        height: parsedData.profile_data.height || null,
        weight: parsedData.profile_data.weight || null,
        goals: parsedData.profile_data.goals || null,
        equipment: parsedData.profile_data.equipment || null,
        target_days_per_week: parsedData.profile_data.target_days_per_week || null
    }).eq('id', user.id)

    // 3. Save User Plan
    // Calculate end_date (21 days from now)
    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 21)

    const { error: planError } = await supabase.from('user_plans').insert({
        user_id: user.id,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        plan_data: parsedData.plan_data,
        diet_suggestions: parsedData.diet_suggestions,
        is_active: true
    })

    if (planError) {
        console.error("Error saving plan:", planError)
        throw new Error("No se pudo guardar el plan en la base de datos.")
    }

    return { success: true }
}

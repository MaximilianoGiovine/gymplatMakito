'use server'

import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const BATCH_SIZE = 5 // Recetas por llamada a la IA

// System prompt strictly formatted for JSON generation of Recipes
const RECIPE_SEEDER_PROMPT = `
Eres un nutricionista experto en programación de bases de datos. 
Tu trabajo es generar un ARRAY JSON de exactamente ${BATCH_SIZE} recetas únicas.
Asegúrate de que sean recetas reales, no inventadas aleatorias sin sentido.

DEBES RESPONDER EXCLUSIVAMENTE CON EL SIGUIENTE FORMATO JSON (No incluyas absolutamente nada de texto extra, ni bloques markdown):
{
  "recipes": [
    {
      "title": "String (Ej. Pollo Asado con Quinoa)",
      "description": "String corto descriptivo",
      "meal_type": "ENUM: 'desayuno', 'almuerzo', 'merienda', 'cena'",
      "budget_level": "ENUM: 'bajo', 'medio', 'alto'",
      "goal_tag": "ENUM: 'masa', 'perdida', 'recomposicion', 'resistencia', 'general'",
      "macros": {
        "calorias": numero (ej. 450),
        "proteinas": numero,
        "carbos": numero,
        "grasas": numero
      },
      "ingredients": ["String 1", "String 2"],
      "instructions": ["Paso 1", "Paso 2"]
    }
  ]
}
`

export async function generateRecipeBatch(mealType: string, goalTag: string, budgetLevel: string) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) throw new Error("API Key de Groq no configurada.")

    const groqClient = new OpenAI({
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: GROQ_API_KEY,
    })

    const userPrompt = `Genera un batch de ${BATCH_SIZE} recetas. 
Todas deben compartir estos parámetros estrictos: 
- Tipo de Comida: ${mealType}
- Objetivo Físico: ${goalTag}
- Nivel de Presupuesto: ${budgetLevel}

Asegúrate de variar los ingredientes principales incluso si comparten la etiqueta de objetivo.`

    const completion = await groqClient.chat.completions.create({
        messages: [
            { role: 'system', content: RECIPE_SEEDER_PROMPT },
            { role: 'user', content: userPrompt }
        ],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: "json_object" },
    })

    const responseJsonStr = completion.choices[0].message.content
    if (!responseJsonStr) throw new Error("Failed to generate recipes")

    return JSON.parse(responseJsonStr).recipes
}

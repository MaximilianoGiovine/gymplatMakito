// scripts/run-recipe-seeder.ts
import { generateRecipeBatch } from '../src/actions/recipe-seeder';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service key to bypass RLS on inserts
);

const MEAL_TYPES = ['desayuno', 'almuerzo', 'merienda', 'cena'];
const GOAL_TAGS = ['masa', 'perdida', 'recomposicion', 'resistencia', 'general'];
const BUDGET_LEVELS = ['bajo', 'medio', 'alto'];

// Delay helper to avoid hitting API Rate Limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runSeeder() {
    console.log("=== INICIANDO MAKITO AI RECIPE SEEDER ===");
    console.log("Asegúrese de tener GROQ_API_KEY y SUPABASE_SERVICE_ROLE_KEY configurados.");

    // Loop through combinations
    for (const goal of GOAL_TAGS) {
        for (const meal of MEAL_TYPES) {
            for (const budget of BUDGET_LEVELS) {
                console.log(`🚀 Generando Lote: ${meal.toUpperCase()} | ${goal.toUpperCase()} | Presupuesto: ${budget.toUpperCase()}`);

                try {
                    // Call the AI Action
                    const recipes = await generateRecipeBatch(meal, goal, budget);

                    if (recipes && recipes.length > 0) {
                        // Insert into Supabase
                        const { error } = await supabase.from('recipes').insert(recipes);
                        if (error) {
                            console.error(`❌ Error guardando en BD para ${meal}-${goal}:`, error.message);
                        } else {
                            console.log(`✅ ¡Lote de ${recipes.length} recetas guardado exitosamente!`);
                        }
                    } else {
                        console.warn(`⚠️ La IA no devolvió recetas para ${meal}-${goal}.`);
                    }

                    // Await 6 seconds between Groq calls to respect Tier 1 rate limits (~10 RPM)
                    console.log("⏳ Esperando 6 segundos para respetar Rate Limits de la IA...");
                    await delay(6000);

                } catch (e: any) {
                    console.error(`🚨 Error crítico procesando ${meal}-${goal}:`, e.message);
                    console.log("Reintentando siguiente lote en 10 segundos...");
                    await delay(10000);
                }
            }
        }
    }

    console.log("=== SEEDING COMPLETADO ===");
}

runSeeder();

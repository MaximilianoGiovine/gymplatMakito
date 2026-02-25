-- Migration: Update Global Recipes Table for the Static AI Nutritional Database
-- Description: Alters existing recipes table to include AI-categorization fields (goal, meal_type, budget).

ALTER TABLE public.recipes 
  ADD COLUMN IF NOT EXISTS meal_type text CHECK (meal_type IN ('desayuno', 'almuerzo', 'merienda', 'cena')),
  ADD COLUMN IF NOT EXISTS budget_level text CHECK (budget_level IN ('bajo', 'medio', 'alto')),
  ADD COLUMN IF NOT EXISTS goal_tag text CHECK (goal_tag IN ('masa', 'perdida', 'recomposicion', 'resistencia', 'general')),
  ADD COLUMN IF NOT EXISTS macros jsonb DEFAULT '{}'::jsonb;

-- Instructions needs to be jsonb array instead of text
ALTER TABLE public.recipes DROP COLUMN IF EXISTS instructions;
ALTER TABLE public.recipes ADD COLUMN instructions jsonb DEFAULT '[]'::jsonb;

-- Default dummy values for existing 3 seed recipes to avoid null check errors if any
UPDATE public.recipes SET meal_type = 'almuerzo', budget_level = 'medio', goal_tag = 'general' WHERE meal_type IS NULL;

-- Now make them not null
ALTER TABLE public.recipes ALTER COLUMN meal_type SET NOT NULL;
ALTER TABLE public.recipes ALTER COLUMN budget_level SET NOT NULL;
ALTER TABLE public.recipes ALTER COLUMN goal_tag SET NOT NULL;

-- Indices for super fast querying
CREATE INDEX IF NOT EXISTS idx_recipes_meal_type ON public.recipes(meal_type);
CREATE INDEX IF NOT EXISTS idx_recipes_goal_tag ON public.recipes(goal_tag);
CREATE INDEX IF NOT EXISTS idx_recipes_budget_level ON public.recipes(budget_level);

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Search, Flame, Droplets, Target, Wallet, ChefHat, Info, Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { Recipe } from '@/types/database'
import Image from 'next/image'

const MEAL_TYPES = ['Todos', 'desayuno', 'almuerzo', 'merienda', 'cena']
const GOAL_TAGS = ['Todos', 'masa', 'perdida', 'recomposicion', 'resistencia', 'general']
const BUDGETS = ['Todos', 'bajo', 'medio', 'alto']

export default function RecipeGallery() {
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [userTier, setUserTier] = useState('free')

    // Filters
    const [filterMeal, setFilterMeal] = useState('Todos')
    const [filterGoal, setFilterGoal] = useState('Todos')
    const [filterBudget, setFilterBudget] = useState('Todos')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        async function fetchRecipesAndAccess() {
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()

                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('subscription_tier, goals')
                        .eq('id', user.id)
                        .single()

                    if (profile) {
                        setUserTier(profile.subscription_tier || 'free')
                        // Auto-select goal filter based on user profile if possible
                        if (profile.goals) {
                            const normalizedGoal = profile.goals.toLowerCase()
                            if (GOAL_TAGS.includes(normalizedGoal)) {
                                setFilterGoal(normalizedGoal)
                            }
                        }
                    }
                }

                // Fetch all recipes (Since it's a curated DB, we can load a generous limit, e.g. 500)
                const { data } = await supabase
                    .from('recipes')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(500)

                if (data) setRecipes(data as Recipe[])
            } catch (error) {
                console.error('Error fetching recipes:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchRecipesAndAccess()
    }, [])

    const filteredRecipes = recipes.filter(recipe => {
        const matchesMeal = filterMeal === 'Todos' || recipe.meal_type === filterMeal
        const matchesGoal = filterGoal === 'Todos' || recipe.goal_tag === filterGoal
        const matchesBudget = filterBudget === 'Todos' || recipe.budget_level === filterBudget
        const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (recipe.description && recipe.description.toLowerCase().includes(searchQuery.toLowerCase()))

        return matchesMeal && matchesGoal && matchesBudget && matchesSearch
    })

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground mt-4">Haciendo match con tu perfil metabólico...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Filters Section */}
            <Card className="bg-primary/5 border-primary/20 sticky top-4 z-10 backdrop-blur-md">
                <CardContent className="p-4 sm:p-6 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar ingredientes o nombre de receta..."
                            className="pl-9 bg-background/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Meal Type */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                                <ChefHat className="w-3 h-3" /> Tipo de Comida
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {MEAL_TYPES.map(meal => (
                                    <button
                                        key={meal}
                                        onClick={() => setFilterMeal(meal)}
                                        className="appearance-none focus:outline-none"
                                    >
                                        <Badge
                                            variant="default"
                                            className={`cursor-pointer capitalize transition-colors ${filterMeal === meal ? '' : 'bg-transparent text-foreground border border-primary/20 hover:bg-muted'}`}
                                        >
                                            {meal}
                                        </Badge>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Goal Tag */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                                <Target className="w-3 h-3" /> Objetivo Físico
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {GOAL_TAGS.map(goal => (
                                    <button
                                        key={goal}
                                        onClick={() => setFilterGoal(goal)}
                                        className="appearance-none focus:outline-none"
                                    >
                                        <Badge
                                            variant="default"
                                            className={`cursor-pointer capitalize transition-colors ${filterGoal === goal ? '' : 'bg-transparent text-foreground border border-primary/20 hover:bg-muted'}`}
                                        >
                                            {goal}
                                        </Badge>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Budget Level */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                                <Wallet className="w-3 h-3" /> Presupuesto
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {BUDGETS.map(budget => (
                                    <button
                                        key={budget}
                                        onClick={() => setFilterBudget(budget)}
                                        className="appearance-none focus:outline-none"
                                    >
                                        <Badge
                                            variant="default"
                                            className={`cursor-pointer capitalize transition-colors ${filterBudget === budget ? '' : 'bg-transparent text-foreground border border-primary/20 hover:bg-muted'}`}
                                        >
                                            {budget}
                                        </Badge>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Counters */}
            <div className="flex justify-between items-end">
                <h2 className="text-xl font-bold tracking-tight">Recetas Compatibles</h2>
                <Badge variant="default" className="font-mono text-sm shadow-sm bg-secondary text-secondary-foreground hover:bg-secondary/80">{filteredRecipes.length} resultados</Badge>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRecipes.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        No se encontraron recetas con esos filtros.
                    </div>
                ) : (
                    filteredRecipes.map((recipe) => {
                        const isLocked = recipe.is_premium && userTier === 'free'

                        return (
                            <Card key={recipe.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-all border-primary/10">
                                <div className="relative h-48 w-full bg-muted/30">
                                    {recipe.image_url ? (
                                        <Image
                                            src={recipe.image_url}
                                            alt={recipe.title}
                                            fill
                                            className={`object-cover ${isLocked ? "blur-md scale-105" : ""}`}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground bg-primary/5">
                                            <ChefHat className="w-12 h-12 opacity-20" />
                                        </div>
                                    )}

                                    {isLocked && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px]">
                                            <div className="bg-primary/90 p-3 rounded-full shadow-lg mb-2">
                                                <Lock className="w-6 h-6 text-primary-foreground" />
                                            </div>
                                            <span className="font-semibold text-foreground tracking-tight drop-shadow-md">Contenido Premium</span>
                                        </div>
                                    )}

                                    {/* Tag overlays */}
                                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                                        <Badge variant="default" className="text-[10px] capitalize bg-background/80 backdrop-blur-sm text-foreground shadow-sm hover:bg-background/80">{recipe.meal_type}</Badge>
                                    </div>

                                    {recipe.is_premium && (
                                        <div className="absolute top-2 right-2">
                                            <Badge className="bg-amber-500 hover:bg-amber-600 shadow-sm border-none uppercase text-[10px] tracking-wider text-white">PRO</Badge>
                                        </div>
                                    )}
                                </div>

                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-lg leading-tight line-clamp-1" title={recipe.title}>{recipe.title}</CardTitle>
                                    <CardDescription className="line-clamp-2 text-xs mt-1">{recipe.description}</CardDescription>
                                </CardHeader>

                                <CardContent className="p-4 pt-2 flex-grow">
                                    {recipe.macros && Object.keys(recipe.macros).length > 0 && (
                                        <div className="grid grid-cols-4 gap-1 text-[10px] text-center mt-2 border-t pt-3">
                                            <div className="flex flex-col items-center p-1 bg-muted/50 rounded-md">
                                                <Flame className="w-3 h-3 text-orange-500 mb-1" />
                                                <span className="font-medium">{recipe.macros.calorias || 0}</span>
                                                <span className="text-muted-foreground">Kcal</span>
                                            </div>
                                            <div className="flex flex-col items-center p-1 bg-muted/50 rounded-md">
                                                <div className="w-3 h-3 rounded-full bg-red-400 mb-1" />
                                                <span className="font-medium">{recipe.macros.proteinas || 0}g</span>
                                                <span className="text-muted-foreground">Pro</span>
                                            </div>
                                            <div className="flex flex-col items-center p-1 bg-muted/50 rounded-md">
                                                <div className="w-3 h-3 rounded-full bg-blue-400 mb-1" />
                                                <span className="font-medium">{recipe.macros.carbos || 0}g</span>
                                                <span className="text-muted-foreground">Carbs</span>
                                            </div>
                                            <div className="flex flex-col items-center p-1 bg-muted/50 rounded-md">
                                                <Droplets className="w-3 h-3 text-yellow-500 mb-1" />
                                                <span className="font-medium">{recipe.macros.grasas || 0}g</span>
                                                <span className="text-muted-foreground">Gra</span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="p-4 pt-0">
                                    <Button className="w-full shadow-sm select-none" variant={isLocked ? "outline" : "primary"} disabled={isLocked}>
                                        {isLocked ? 'Desbloquear Acceso' : 'Ver Preparación'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    )
}

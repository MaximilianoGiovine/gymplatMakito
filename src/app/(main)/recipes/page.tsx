import RecipeGallery from '@/features/recipes/components/RecipeGallery'

export default function RecipesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Nutrition & Recipes</h1>
                <p className="text-muted-foreground mt-2">Discover healthy meals to fuel your workouts.</p>
            </div>

            <RecipeGallery />
        </div>
    )
}

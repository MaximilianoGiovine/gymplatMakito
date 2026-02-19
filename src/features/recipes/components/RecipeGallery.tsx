import { createClient } from "@/lib/supabase/server";
import { Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link"; // Not used but good practice
import { Badge } from "@/components/ui/badge"; // Assuming shadcn/ui badge exists or generic
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui button exists

async function getRecipes() {
    const supabase = await createClient();
    const { data } = await supabase.from("recipes").select("*").order("created_at", { ascending: false });
    return data ?? [];
}

async function getUserTier() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "free";

    const { data } = await supabase.from("profiles").select("subscription_tier").eq("id", user.id).single();
    return data?.subscription_tier ?? "free";
}

export default async function RecipeGallery() {
    const recipes = await getRecipes();
    const tier = await getUserTier();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => {
                const isLocked = recipe.is_premium && tier === "free";

                return (
                    <div key={recipe.id} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative h-48 w-full bg-gray-100">
                            {recipe.image_url ? (
                                <Image
                                    src={recipe.image_url}
                                    alt={recipe.title}
                                    fill
                                    className={`object-cover ${isLocked ? "blur-sm" : ""}`}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                            )}
                            {isLocked && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <Lock className="w-8 h-8 text-white" />
                                </div>
                            )}
                            {recipe.is_premium && (
                                <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                    PREMIUM
                                </span>
                            )}
                        </div>

                        <div className="p-4">
                            <h3 className="font-bold text-lg">{recipe.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{recipe.description}</p>

                            <div className="mt-4">
                                {isLocked ? (
                                    <Button variant="outline" className="w-full" disabled>
                                        Upgrade to Unlock
                                    </Button>
                                ) : (
                                    <Button className="w-full">
                                        View Recipe
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

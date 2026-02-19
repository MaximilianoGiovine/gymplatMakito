import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createExercise, createRecipe } from "@/features/admin/actions";

export default async function AdminPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        redirect("/dashboard"); // Or 403 page
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <div className="grid md:grid-cols-2 gap-8">
                <section className="p-6 border rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Add Exercise</h2>
                    <form action={createExercise} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Name</label>
                            <input name="name" required className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Difficulty</label>
                            <select name="difficulty" className="w-full p-2 border rounded">
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" name="is_premium" />
                                <span>Premium Content?</span>
                            </label>
                        </div>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                            Create Exercise
                        </button>
                    </form>
                </section>

                <section className="p-6 border rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Add Recipe</h2>
                    <form action={createRecipe} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Title</label>
                            <input name="title" required className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Ingredients (JSON Array)</label>
                            <textarea
                                name="ingredients"
                                defaultValue='["Ingredient 1", "Ingredient 2"]'
                                className="w-full p-2 border rounded font-mono"
                            />
                        </div>
                        <div>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" name="is_premium" />
                                <span>Premium Recipe?</span>
                            </label>
                        </div>
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                            Create Recipe
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}

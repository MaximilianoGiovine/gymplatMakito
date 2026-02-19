"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createExercise(formData: FormData) {
    const supabase = await createClient();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const difficulty = formData.get("difficulty") as string;
    const equipment = formData.get("equipment") as string;
    const video_url = formData.get("video_url") as string;
    const is_premium = formData.get("is_premium") === "on";

    const { error } = await supabase.from("exercises").insert({
        name,
        description,
        difficulty,
        equipment,
        video_url,
        is_premium,
    });

    if (error) throw new Error(error.message);
    revalidatePath("/admin");
    revalidatePath("/workout/tracker");
}

export async function createRecipe(formData: FormData) {
    const supabase = await createClient();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const ingredients = JSON.parse(formData.get("ingredients") as string);
    const is_premium = formData.get("is_premium") === "on";
    const image_url = formData.get("image_url") as string;

    const { error } = await supabase.from("recipes").insert({
        title,
        description,
        ingredients,
        is_premium,
        image_url,
    });

    if (error) throw new Error(error.message);
    revalidatePath("/admin");
    revalidatePath("/recipes");
}

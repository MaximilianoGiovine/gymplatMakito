import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export type Profile = {
    id: string;
    email: string | null;
    subscription_tier: "free" | "premium";
    created_at: string;
} | null;

export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function getUser() {
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (user) {
                    setUser(user);
                    // Fetch Profile
                    const { data: profileData } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", user.id)
                        .single();

                    setProfile(profileData);
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        }

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
                if (!session?.user) setProfile(null);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    return { user, profile, loading };
}

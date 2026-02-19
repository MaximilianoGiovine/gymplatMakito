import { createClient } from "@/lib/supabase/server";

async function getLeaderboard() {
    const supabase = await createClient();
    // Join logs or streaks. Using 'streaks' table for simplicity.
    // We need to join with profiles to get emails/names.
    // Note: Supabase JS select with joined tables requires setting up relationships in DB or code.
    // Assuming 'profiles' and 'streaks' are related by user_id

    const { data } = await supabase
        .from("streaks")
        .select(`
      current_streak,
      profiles (
        email
      )
    `)
        .order("current_streak", { ascending: false })
        .limit(10);

    return data ?? [];
}

export default async function Leaderboard() {
    const leaders = await getLeaderboard();

    return (
        <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🏆</span> Global Leaderboard
            </h2>
            <div className="space-y-2">
                {leaders.map((entry, index) => {
                    // @ts-ignore - Supabase types inference might be tricky without generated types
                    const email = entry.profiles?.email || "Anonymous";
                    const displayEmail = email.split("@")[0]; // Privacy

                    return (
                        <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md transition-colors">
                            <div className="flex items-center gap-4">
                                <span className={`
                    w-8 h-8 flex items-center justify-center rounded-full font-bold
                    ${index === 0 ? "bg-yellow-100 text-yellow-700" :
                                        index === 1 ? "bg-gray-100 text-gray-700" :
                                            index === 2 ? "bg-orange-100 text-orange-700" : "text-gray-500"}
                `}>
                                    {index + 1}
                                </span>
                                <span className="font-medium text-gray-900">{displayEmail}</span>
                            </div>
                            <div className="flex items-center gap-1 text-orange-500 font-bold">
                                <span>🔥</span>
                                <span>{entry.current_streak}</span>
                            </div>
                        </div>
                    )
                })}
                {leaders.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No streaks yet. Be the first!</p>
                )}
            </div>
        </div>
    );
}

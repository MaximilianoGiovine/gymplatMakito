"use client";

import { useState, useEffect } from "react";
import { getExercises, logWorkoutSet } from "@/features/workouts/actions";
import { Button } from "@/components/ui/button"; // Shadcn
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Shadcn
// Assuming generic UI components exist or using standard HTML for speed

type Exercise = {
    id: string;
    name: string;
};

export default function WorkoutTracker() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getExercises().then(data => {
            setExercises(data);
            setLoading(false);
        });
    }, []);

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Log Set</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={async (formData) => {
                    await logWorkoutSet(formData);
                    alert("Set logged!");
                }} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium mb-1">Exercise</label>
                        <select name="exercise_id" className="w-full p-2 border rounded" required>
                            {loading ? <option>Loading...</option> :
                                exercises.map(ex => (
                                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                                ))
                            }
                        </select>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Sets</label>
                            <input type="number" name="sets" className="w-full p-2 border rounded" defaultValue={1} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Reps</label>
                            <input type="number" name="reps" className="w-full p-2 border rounded" defaultValue={10} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                            <input type="number" name="weight" step="0.5" className="w-full p-2 border rounded" defaultValue={20} required />
                        </div>
                    </div>

                    <Button type="submit" className="w-full">
                        Log Set
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

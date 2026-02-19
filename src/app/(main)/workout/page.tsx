import WorkoutTracker from '@/features/workouts/components/WorkoutTracker'

export default function WorkoutPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Workout Tracker</h1>
                <p className="text-muted-foreground mt-2">Log your sets and track your progress.</p>
            </div>

            <div className="max-w-2xl mx-auto">
                <WorkoutTracker />
            </div>
        </div>
    )
}

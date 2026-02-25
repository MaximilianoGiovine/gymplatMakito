import WorkoutManager from '@/features/workouts/components/WorkoutManager'

export default function WorkoutPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tu Entrenamiento de Hoy</h1>
                <p className="text-muted-foreground mt-2">Sigue las instrucciones y timers generados por Makito.</p>
            </div>

            <div className="w-full mx-auto">
                <WorkoutManager />
            </div>
        </div>
    )
}

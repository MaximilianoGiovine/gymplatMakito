import { ProgressDashboard } from '@/features/dashboard/components/ProgressDashboard'

export default function ProgressPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tu Progreso Interactivo</h1>
                <p className="text-muted-foreground mt-2">Revisa tu constancia, ejercicios completados y próximos retos.</p>
            </div>

            <div className="w-full mx-auto">
                <ProgressDashboard />
            </div>
        </div>
    )
}

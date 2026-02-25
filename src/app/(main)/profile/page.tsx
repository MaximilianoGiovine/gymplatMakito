import { ProfileDashboard } from '@/features/dashboard/components/ProfileDashboard'

export default function ProfilePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
                <p className="text-muted-foreground mt-2">Gestiona tu información personal, objetivos e historial.</p>
            </div>

            <div className="w-full mx-auto">
                <ProfileDashboard />
            </div>
        </div>
    )
}

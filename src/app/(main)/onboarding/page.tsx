import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingChat } from '@/features/onboarding/components/OnboardingChat'

export default async function OnboardingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if already completed
    const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

    if (profile?.onboarding_completed) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">
            <div className="max-w-3xl w-full text-center mb-8 space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight">Bienvenido a Gymplat</h1>
                <p className="text-muted-foreground text-lg">Antes de empezar, necesitamos conocerte para crear tu Plan de 21 Días.</p>
            </div>

            <OnboardingChat />
        </div>
    )
}

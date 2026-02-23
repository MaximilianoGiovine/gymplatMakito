import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardCalendar } from '@/features/dashboard/components/DashboardCalendar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Check Onboarding Status
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) {
    redirect('/onboarding')
  }

  // 2. Fetch Active Plan
  const { data: activePlan } = await supabase
    .from('user_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const userName = profile?.full_name || user.email?.split('@')[0] || 'Atleta'

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">¡A darle, {userName}!</h1>
          <p className="text-muted-foreground mt-2">Aquí está tu ruta personalizada para alcanzar tus metas.</p>
        </div>

        {/* Quick action to force new plan if needed */}
        <Button variant="outline" asChild>
          <Link href="/onboarding" className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Nuevo Plan (Re-evaluación)
          </Link>
        </Button>
      </div>

      {activePlan ? (
        <DashboardCalendar plan={activePlan} />
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-muted/20">
          <h3 className="text-xl font-bold mb-2">No tienes un plan activo</h3>
          <p className="text-muted-foreground mb-6">Parece que hubo un error al generar tu plan, o ya expiró.</p>
          <Button asChild size="lg">
            <Link href="/onboarding">Iniciar Evaluación Makito</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

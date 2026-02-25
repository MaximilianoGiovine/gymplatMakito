'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { calculateCurrentDayNumber } from '@/lib/date-utils'
import { Loader2, User, Target, Dumbbell, Clock, Activity, Settings2, ShieldCheck, Mail, Save, CalendarDays, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function ProfileDashboard() {
    const [profile, setProfile] = useState<any>(null)
    const [plan, setPlan] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState<any>({})
    const [message, setMessage] = useState('')

    useEffect(() => {
        async function fetchData() {
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single()

                    if (profileData) {
                        setProfile(profileData)
                        setFormData({
                            full_name: profileData.full_name || '',
                            height: profileData.height || '',
                            weight: profileData.weight || '',
                        })
                    }

                    const { data: planData } = await supabase
                        .from('user_plans')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('is_active', true)
                        .single()

                    if (planData) setPlan(planData)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleSave = async () => {
        setIsSaving(true)
        setMessage('')
        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    height: Number(formData.height) || null,
                    weight: Number(formData.weight) || null,
                })
                .eq('id', profile.id)

            if (error) throw error
            setMessage('Perfil actualizado exitosamente.')
        } catch (e: any) {
            setMessage('Error al actualizar: ' + e.message)
        } finally {
            setIsSaving(false)
            setTimeout(() => setMessage(''), 3000)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!profile) return null

    // Compute progress/streak stats from plan
    let currentDayLabel = 'N/A'
    let currentStreak = 0
    let totalCompleted = 0

    if (plan) {
        currentDayLabel = `Día ${Math.max(1, Math.min(21, calculateCurrentDayNumber(plan.start_date)))} de 21`
        const completedDays = plan.plan_data.filter((day: any) => day.isCompleted)
        totalCompleted = completedDays.length

        // Simple streak calculation (count contiguous completed days backwards from current expected day)
        // For simplicity, we just count the total completed for now as requested.
        currentStreak = totalCompleted // In a real app this would check contiguous consecutive dates. Let's assume absolute completion for now to motivate.
    }

    return (
        <div className="grid gap-6 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left Column: Essential Identity */}
            <Card className="md:col-span-1 h-fit shadow-md border-primary/10">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mb-4 ring-4 ring-background border-2 border-primary/20">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <User className="w-12 h-12 text-primary" />
                        )}
                    </div>
                    <CardTitle className="text-xl">{profile.full_name || 'Atleta Sin Nombre'}</CardTitle>
                    <CardDescription className="flex items-center justify-center gap-2 mt-1">
                        <Mail className="w-3 h-3" /> {profile.email}
                    </CardDescription>

                    <div className="flex justify-center gap-2 mt-4">
                        <Badge variant="default" className="capitalize bg-secondary text-secondary-foreground hover:bg-secondary/80">
                            {profile.role === 'admin' ? <ShieldCheck className="w-3 h-3 mr-1" /> : null}
                            {profile.role}
                        </Badge>
                        <Badge variant="default" className="border border-primary/30 text-primary uppercase bg-transparent hover:bg-transparent">
                            {profile.subscription_tier}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Miembro desde</span>
                            <span className="font-medium">{new Date(profile.created_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Onboarding</span>
                            {profile.onboarding_completed ? (
                                <span className="text-green-500 font-medium">Completado</span>
                            ) : (
                                <span className="text-amber-500 font-medium">Pendiente</span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Right Column: Stats & Settings */}
            <div className="md:col-span-2 space-y-6">

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                <Activity className="w-4 h-4 text-primary" /> Posición actual
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-1">
                            <div className="text-2xl font-bold">{currentDayLabel}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-500" /> Racha (Días)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-1">
                            <div className="text-2xl font-bold">{currentStreak} <span className="text-sm font-normal text-muted-foreground">días</span></div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                <Target className="w-4 h-4 text-green-500" /> Frecuencia
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-1">
                            <div className="text-2xl font-bold">
                                {profile.target_days_per_week ? `${profile.target_days_per_week}x` : '-'} <span className="text-sm font-normal text-muted-foreground">sem</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                <Dumbbell className="w-4 h-4 text-orange-500" /> Equipamiento
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-1">
                            <div className="text-sm font-medium capitalize truncate" title={profile.equipment || '-'}>
                                {profile.equipment || '-'}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Profile Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Settings2 className="w-5 h-5" /> Datos Personales</CardTitle>
                        <CardDescription>Actualiza tu información física para cálculos médicos y macronutricionales.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Nombre Completo</Label>
                                <Input
                                    id="full_name"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Objetivo Principal (Detectado por Makito)</Label>
                                <Input value={profile.goals || 'No definido'} disabled className="bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="height">Altura (cm)</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    value={formData.height}
                                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="weight">Peso Inicial (kg)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    value={formData.weight}
                                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                />
                            </div>
                        </div>
                        {message && (
                            <div className="p-3 bg-primary/10 text-primary rounded-md text-sm font-medium border border-primary/20 transition-all">
                                {message}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="bg-muted/30 border-t px-6 py-4">
                        <Button onClick={handleSave} disabled={isSaving} className="ml-auto gap-2 shadow-sm">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Guardar Cambios
                        </Button>
                    </CardFooter>
                </Card>

            </div>
        </div>
    )
}

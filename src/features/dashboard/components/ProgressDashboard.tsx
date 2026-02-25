'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { calculateCurrentDayNumber, getDisplayDateForDay } from '@/lib/date-utils'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Trophy, Crosshair, Dumbbell, Loader2, Target } from 'lucide-react'

export function ProgressDashboard() {
    const [plan, setPlan] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchPlan() {
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data } = await supabase
                        .from('user_plans')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('is_active', true)
                        .single()

                    if (data) setPlan(data)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setIsLoading(false)
            }
        }
        fetchPlan()
    }, [])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!plan) {
        return (
            <Card className="text-center py-12">
                <CardContent>
                    <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h2 className="text-2xl font-bold mb-2">Aún no hay datos de progreso</h2>
                    <p className="text-muted-foreground">Termina tu entrevista de Onboarding con Makito para generar tu primer plan de 21 días.</p>
                </CardContent>
            </Card>
        )
    }

    const currentDayNumber = Math.max(1, Math.min(21, calculateCurrentDayNumber(plan.start_date)))
    const completedDays = plan.plan_data.filter((day: any) => day.isCompleted)
    const totalDaysCompleted = completedDays.length
    const progressPercentage = (totalDaysCompleted / 21) * 100

    // Sum total exercises done
    let totalExercisesDone = 0
    completedDays.forEach((day: any) => {
        if (!day.isRestDay && day.exercises) {
            totalExercisesDone += day.exercises.length
        }
    })

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-primary" />
                            Días Completados
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{totalDaysCompleted} <span className="text-muted-foreground text-lg font-normal">/ 21</span></div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Crosshair className="w-4 h-4 text-green-500" />
                            Día Actual en Calendario
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">Día {currentDayNumber}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Dumbbell className="w-4 h-4 text-orange-500" />
                            Total de Ejercicios
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{totalExercisesDone}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Global Progress Bar */}
            <Card>
                <CardHeader>
                    <CardTitle>Desarrollo del Plan</CardTitle>
                    <CardDescription>Estás a {21 - totalDaysCompleted} días de tu próximo Fit Test con Makito.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Progress value={progressPercentage} className="h-4" />
                    <p className="text-sm text-right font-medium text-muted-foreground">{Math.round(progressPercentage)}% completado</p>
                </CardContent>
            </Card>

            {/* History Feed */}
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Actividad</CardTitle>
                    <CardDescription>Resumen de los días de entrenamiento que has marcado como completados.</CardDescription>
                </CardHeader>
                <CardContent>
                    {completedDays.length === 0 ? (
                        <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground">
                            Aún no has completado ninguna rutina interactiva. ¡Inicia con el Día 1 en la pestaña de Workouts!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {completedDays.reverse().map((day: any) => (
                                <div key={day.dayNumber} className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-green-500/10 p-2 rounded-full">
                                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-base">Día {day.dayNumber}: {day.focus}</p>
                                            <p className="text-sm text-muted-foreground capitalize">
                                                {getDisplayDateForDay(plan.start_date, day.dayNumber)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border text-xs font-medium">
                                            <Dumbbell className="w-3.5 h-3.5 text-primary" />
                                            {day.isRestDay ? 'Descanso' : `${day.exercises.length} Ejercicios`}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

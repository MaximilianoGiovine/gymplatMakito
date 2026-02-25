'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calculateCurrentDayNumber } from '@/lib/date-utils'
import WorkoutExecution from './WorkoutExecution'
import { Loader2, CalendarX2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function WorkoutManager() {
    const [dailyWorkout, setDailyWorkout] = useState<any>(null)
    const [planId, setPlanId] = useState<string | null>(null)
    const [fullPlanData, setFullPlanData] = useState<any[] | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isCompletedToday, setIsCompletedToday] = useState(false)

    useEffect(() => {
        async function fetchTodayWorkout() {
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) {
                    setError('No estás autenticado.')
                    return
                }

                // Get Active Plan
                const { data: plan, error: planError } = await supabase
                    .from('user_plans')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('is_active', true)
                    .single()

                if (planError || !plan) {
                    setError('No tienes un plan activo de 21 días. Habla con Makito para crear uno.')
                    return
                }

                // Calculate which day we are on relative to start_date
                const currentDayNumber = calculateCurrentDayNumber(plan.start_date)

                if (currentDayNumber > 21) {
                    setError('Tu plan de 21 días ha concluido. Es hora del Fit Test.')
                    return
                }

                // Find the specific day's workout data
                const todaysWorkout = plan.plan_data.find((day: any) => day.dayNumber === currentDayNumber)

                if (!todaysWorkout) {
                    setError(`No se encontró rutina para el Día ${currentDayNumber}.`)
                    return
                }

                setDailyWorkout(todaysWorkout)
                setPlanId(plan.id)
                setFullPlanData(plan.plan_data)

            } catch (err: any) {
                console.error(err)
                setError('Hubo un error cargando tu rutina de hoy.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchTodayWorkout()
    }, [])

    const handleWorkoutComplete = async () => {
        setIsCompletedToday(true)

        if (!planId || !fullPlanData || !dailyWorkout) return;

        // Create a new array reference with the updated day marked as completed
        const updatedPlanData = fullPlanData.map((day: any) =>
            day.dayNumber === dailyWorkout.dayNumber
                ? { ...day, isCompleted: true }
                : day
        );

        const supabase = createClient()
        await supabase
            .from('user_plans')
            .update({ plan_data: updatedPlanData })
            .eq('id', planId)
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Cargando el entrenamiento de hoy...</p>
            </div>
        )
    }

    if (error) {
        return (
            <Card className="max-w-md mx-auto text-center border-destructive/20 shadow-lg">
                <CardHeader>
                    <CalendarX2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <CardTitle>Entrenamiento no Disponible</CardTitle>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/dashboard" passHref>
                        <Button className="w-full">Volver al Dashboard</Button>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    if (isCompletedToday) {
        return (
            <Card className="max-w-md mx-auto text-center border-primary/20 bg-primary/5 shadow-lg">
                <CardHeader>
                    <span className="text-5xl mb-4 block">🏆</span>
                    <CardTitle className="text-2xl text-primary">¡Entrenamiento Completado!</CardTitle>
                    <CardDescription className="text-lg">
                        Has terminado tu rutina interactiva del Día {dailyWorkout?.dayNumber}. ¡Excelente trabajo!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/dashboard" passHref>
                        <Button size="lg" className="w-full">Ver Calendario</Button>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    if (dailyWorkout) {
        return <WorkoutExecution dailyWorkout={dailyWorkout} onComplete={handleWorkoutComplete} />
    }

    return null
}

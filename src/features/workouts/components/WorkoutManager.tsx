'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import WorkoutExecution from './WorkoutExecution'
import { Loader2, CalendarX2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function WorkoutManager() {
    const [dailyWorkout, setDailyWorkout] = useState<any>(null)
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
                const startDate = new Date(plan.start_date)
                const today = new Date()

                // Reset times to compare just dates
                startDate.setHours(0, 0, 0, 0)
                today.setHours(0, 0, 0, 0)

                const diffTime = Math.abs(today.getTime() - startDate.getTime())
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                // Day number is 1-indexed. If diff is 0 (same day), it's day 1.
                const currentDayNumber = diffDays + 1

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

            } catch (err: any) {
                console.error(err)
                setError('Hubo un error cargando tu rutina de hoy.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchTodayWorkout()
    }, [])

    const handleWorkoutComplete = () => {
        // TODO: In a real app, log this completion to Supabase `logs` or `fit_tests`
        setIsCompletedToday(true)
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

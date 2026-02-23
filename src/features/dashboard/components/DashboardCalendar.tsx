'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dumbbell, CheckCircle2, ChevronRight, Utensils, CalendarDays } from 'lucide-react'

// Typing based on our JSON structure
type Exercise = { name: string, sets: number, reps: string, tips: string }
type PlanDay = { dayNumber: number, isRestDay: boolean, focus: string, exercises: Exercise[] }
type DietSuggestion = { mealType: string, description: string, macros: string }

interface DashboardCalendarProps {
    plan: {
        id: string
        start_date: string
        end_date: string
        plan_data: PlanDay[]
        diet_suggestions: DietSuggestion[]
    }
}

export function DashboardCalendar({ plan }: DashboardCalendarProps) {
    // Calculate current day based on start_date
    const startDate = new Date(plan.start_date)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Cap at 21, default to 1 if negative (timezone edge cases)
    const currentDayNumber = Math.max(1, Math.min(21, diffDays))

    const [selectedDay, setSelectedDay] = useState<number>(currentDayNumber)

    const activeDayData = plan.plan_data.find(d => d.dayNumber === selectedDay) || plan.plan_data[0]

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <CalendarDays className="text-primary w-6 h-6" />
                                Tu Plan de 21 Días
                            </CardTitle>
                            <CardDescription>Día actual: {currentDayNumber} de 21</CardDescription>
                        </div>
                        {currentDayNumber >= 21 && (
                            <Button onClick={() => alert("Fit Test coming soon!")} className="animate-pulse shadow-lg bg-primary text-primary-foreground">
                                ¡Hacer Fit Test!
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2 mb-8">
                        {plan.plan_data.map((day) => {
                            const isPast = day.dayNumber < currentDayNumber
                            const isToday = day.dayNumber === currentDayNumber
                            const isSelected = day.dayNumber === selectedDay

                            return (
                                <button
                                    key={day.dayNumber}
                                    onClick={() => setSelectedDay(day.dayNumber)}
                                    className={`
                    relative p-2 rounded-lg border-2 flex flex-col items-center justify-center transition-all min-h-[60px]
                    ${isSelected ? 'border-primary ring-2 ring-primary/20 scale-105 shadow-md z-10' : 'border-transparent hover:border-border'}
                    ${isToday ? 'bg-primary/10 font-bold' : 'bg-card'}
                    ${isPast ? 'opacity-70' : ''}
                  `}
                                >
                                    <span className="text-xs text-muted-foreground">Día</span>
                                    <span className={`text-lg leading-none ${isToday || isSelected ? 'text-primary' : ''}`}>
                                        {day.dayNumber}
                                    </span>

                                    {isPast && !day.isRestDay && (
                                        <CheckCircle2 className="w-3 h-3 absolute top-1 right-1 text-green-500" />
                                    )}
                                    {day.isRestDay && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground absolute bottom-2" />
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {/* Active Day Detail */}
                    <div className="bg-muted/30 rounded-2xl p-6 border shadow-inner">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    Día {activeDayData.dayNumber}: {activeDayData.focus}
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    {selectedDay === currentDayNumber ? 'Hoy' : selectedDay < currentDayNumber ? 'Completado' : 'Próximamente'}
                                </p>
                            </div>
                            {activeDayData.isRestDay ? (
                                <div className="bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full text-sm font-medium">
                                    Día de Descanso
                                </div>
                            ) : (
                                <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
                                    <Dumbbell className="w-4 h-4" /> Entrenamiento Activo
                                </div>
                            )}
                        </div>

                        {!activeDayData.isRestDay && activeDayData.exercises.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {activeDayData.exercises.map((ex, idx) => (
                                    <div key={idx} className="bg-card p-4 rounded-xl border shadow-sm">
                                        <h4 className="font-semibold mb-2">{ex.name}</h4>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                            <span className="bg-background px-2 py-1 rounded-md border">{ex.sets} series</span>
                                            <span>×</span>
                                            <span className="bg-background px-2 py-1 rounded-md border">{ex.reps} reps</span>
                                        </div>
                                        {ex.tips && (
                                            <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
                                                <span className="font-medium text-foreground">Tip de Makito:</span> {ex.tips}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>Aprovecha este día para estirar, caminar ligero o simplemente descansar.</p>
                                <p>La recuperación es clave para el crecimiento muscular.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Diet Suggestions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Utensils className="text-primary w-5 h-5" />
                        Sugerencias Nutricionales de Makito
                    </CardTitle>
                    <CardDescription>Opciones adaptadas a tus objetivos para acompañar tu plan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {plan.diet_suggestions.map((meal, idx) => (
                            <div key={idx} className="bg-card border rounded-xl p-4 flex flex-col hover:shadow-md transition-shadow">
                                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">{meal.mealType}</div>
                                <p className="text-sm flex-1 mb-4">{meal.description}</p>
                                <div className="text-xs bg-muted p-2 rounded-lg text-muted-foreground">
                                    <span className="font-semibold block mb-1">Macros:</span>
                                    {meal.macros}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Play, Pause, SkipForward, CheckCircle2, Dumbbell, Timer, ArrowRight } from 'lucide-react'

// Types for the Workout Plan
interface Exercise {
    name: string
    sets: number
    reps: string
    tips: string
}

interface DailyWorkout {
    dayNumber: number
    isRestDay: boolean
    focus: string
    exercises: Exercise[]
}

interface WorkoutExecutionProps {
    dailyWorkout: DailyWorkout
    onComplete: () => void
}

export default function WorkoutExecution({ dailyWorkout, onComplete }: WorkoutExecutionProps) {
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
    const [currentSet, setCurrentSet] = useState(1)

    // Timer States
    // default Work time: 45s, Rest time: 60s
    const [timerState, setTimerState] = useState<'idle' | 'work' | 'rest'>('idle')
    const [timeLeft, setTimeLeft] = useState(0)
    const [totalTimeForPhase, setTotalTimeForPhase] = useState(1)

    // Current Exercise Safety Checks
    const exercise = dailyWorkout.exercises[currentExerciseIndex]
    const isLastExercise = currentExerciseIndex === dailyWorkout.exercises.length - 1
    const isLastSet = exercise ? currentSet === exercise.sets : true

    // Format mm:ss
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const startWork = useCallback(() => {
        const workSeconds = 45 // Fixed 45s for work (can be customized later)
        setTimerState('work')
        setTimeLeft(workSeconds)
        setTotalTimeForPhase(workSeconds)
    }, [])

    const startRest = useCallback(() => {
        const restSeconds = 60 // Fixed 60s for rest
        setTimerState('rest')
        setTimeLeft(restSeconds)
        setTotalTimeForPhase(restSeconds)
    }, [])

    const advanceProgress = useCallback(() => {
        if (!isLastSet) {
            // Next set of current exercise
            setCurrentSet(prev => prev + 1)
            setTimerState('idle')
        } else if (!isLastExercise) {
            // Move to next exercise
            setCurrentExerciseIndex(prev => prev + 1)
            setCurrentSet(1)
            setTimerState('idle')
        } else {
            // Workout Complete
            setTimerState('idle')
            onComplete()
        }
    }, [isLastSet, isLastExercise, onComplete])

    // Main Timer Loop
    useEffect(() => {
        if (timerState === 'idle') return

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval)
                    // Auto transition when timer hits 0
                    if (timerState === 'work') {
                        // After work, start rest (unless it's the very last set of the workout, then just finish)
                        if (isLastSet && isLastExercise) {
                            advanceProgress()
                        } else {
                            startRest()
                        }
                    } else if (timerState === 'rest') {
                        // After rest, wait for user to start next set OR auto-start
                        advanceProgress()
                    }
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [timerState, isLastSet, isLastExercise, advanceProgress, startRest])

    if (dailyWorkout.isRestDay) {
        return (
            <Card className="max-w-xl mx-auto text-center py-12">
                <CardHeader>
                    <CardTitle className="text-3xl">Día de Descanso</CardTitle>
                    <CardDescription className="text-lg mt-2">
                        {dailyWorkout.focus}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CheckCircle2 className="w-24 h-24 mx-auto text-green-500 mb-6 opacity-80" />
                    <p className="text-muted-foreground">Makito sugiere que aproveches este día para recuperar tus músculos. La recuperación es tan importante como el entrenamiento.</p>
                </CardContent>
                <CardFooter className="justify-center">
                    <Button onClick={onComplete} size="lg">Entendido</Button>
                </CardFooter>
            </Card>
        )
    }

    if (!exercise) return null

    // Calculate overall progress
    const totalExercises = dailyWorkout.exercises.length
    const overallProgress = ((currentExerciseIndex) / totalExercises) * 100

    return (
        <div className="max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Stats */}
            <div className="flex justify-between items-center text-sm font-medium text-muted-foreground px-2">
                <span>Día {dailyWorkout.dayNumber} • {dailyWorkout.focus}</span>
                <span>Ejercicio {currentExerciseIndex + 1} / {totalExercises}</span>
            </div>

            <Progress value={overallProgress} className="h-2" />

            <Card className="shadow-xl border-primary/10 overflow-hidden relative">
                {/* Background Color Hint based on State */}
                <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-500 ${timerState === 'work' ? 'bg-red-500' : timerState === 'rest' ? 'bg-blue-500' : 'bg-primary'
                    }`} />

                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl mt-4">{exercise.name}</CardTitle>
                    <CardDescription className="text-base font-medium flex items-center justify-center gap-2 mt-2">
                        <Dumbbell className="w-4 h-4" />
                        Serie {currentSet} de {exercise.sets} • {exercise.reps} reps
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-8 pt-6">
                    {/* Timer Display */}
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className={`relative flex items-center justify-center w-48 h-48 rounded-full border-4 transition-colors duration-500 shadow-inner ${timerState === 'work' ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400'
                            : timerState === 'rest' ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                : 'border-muted bg-muted/20 text-foreground'
                            }`}>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-mono font-bold tracking-tighter">
                                    {timerState === 'idle' ? '00:00' : formatTime(timeLeft)}
                                </span>
                                <span className="text-sm font-semibold uppercase tracking-widest mt-2 opacity-80">
                                    {timerState === 'work' ? 'TRABAJO' : timerState === 'rest' ? 'DESCANSO' : 'LISTO'}
                                </span>
                            </div>

                            {/* Circular Progress (CSS pseudo element simulation) */}
                            {timerState !== 'idle' && (
                                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                                    <circle
                                        cx="96" cy="96" r="94"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        strokeDasharray={2 * Math.PI * 94}
                                        strokeDashoffset={(2 * Math.PI * 94) * (1 - (timeLeft / totalTimeForPhase))}
                                        className="transition-all duration-1000 ease-linear opacity-50"
                                    />
                                </svg>
                            )}
                        </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-xl text-sm text-center border">
                        <span className="font-semibold block mb-1">Tip de Makito:</span>
                        <span className="text-muted-foreground">{exercise.tips}</span>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pt-2">
                    {timerState === 'idle' ? (
                        <Button onClick={startWork} size="lg" className="w-full text-lg h-14 rounded-xl shadow-lg">
                            <Play className="w-5 h-5 mr-2" fill="currentColor" />
                            Iniciar Serie {currentSet}
                        </Button>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 w-full">
                            <Button
                                variant={timerState === 'work' ? 'danger' : 'secondary'}
                                onClick={timerState === 'work' ? startRest : advanceProgress}
                                className="h-14 rounded-xl font-bold"
                            >
                                <SkipForward className="w-5 h-5 mr-2" />
                                Omitir
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setTimerState('idle')}
                                className="h-14 rounded-xl font-bold"
                            >
                                <Pause className="w-5 h-5 mr-2" />
                                Pausa
                            </Button>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}

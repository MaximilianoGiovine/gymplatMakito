'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { processOnboardingChat, generateAndSave21DayPlan } from '../actions'
import { Button } from '@/components/ui/button'
import { Bot, User, Send, Loader2, Dumbbell } from 'lucide-react'

type Message = { role: 'user' | 'assistant', content: string }

export function OnboardingChat() {
    const router = useRouter()
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: '¡Bienvenido a Gymplat! Soy Makito, tu nuevo personal trainer de IA. Para crear tu Plan de 21 Días a medida, necesito conocerte un poco. ¿Cuál es tu altura y peso aproximado?' }
    ])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading || isGeneratingPlan) return

        const newMsgs: Message[] = [...messages, { role: 'user', content: inputValue }]
        setMessages(newMsgs)
        setInputValue('')
        setIsLoading(true)

        try {
            const response = await processOnboardingChat(newMsgs)

            if (response.status === 'error') {
                setMessages(prev => [...prev, { role: 'assistant', content: response.message }])
                setIsLoading(false)
                return
            }

            setMessages(prev => [...prev, { role: 'assistant', content: response.message }])

            if (response.status === 'completed') {
                setIsGeneratingPlan(true)
                // Give UI time to update
                await new Promise(r => setTimeout(r, 1000))

                await generateAndSave21DayPlan(newMsgs)

                // Redirect to dashboard where plan will be visible via Hard Reload
                window.location.href = '/dashboard'
            }

        } catch (error: any) {
            console.error(error)
            setMessages(prev => [...prev, { role: 'assistant', content: `Uf, perdóname, tuve un error interno catastrófico: ${error.message || 'Error Desconocido'}. ¿Puedes repetir eso?` }])
        } finally {
            setIsLoading(false)
        }
    }

    if (isGeneratingPlan) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                    <div className="relative bg-primary/10 p-6 rounded-full">
                        <Dumbbell className="w-16 h-16 text-primary animate-bounce" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">Diseñando tu Plan de 21 Días...</h2>
                    <p className="text-muted-foreground flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Makito está analizando tus respuestas
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[70vh] max-h-[800px] w-full max-w-2xl mx-auto bg-card border shadow-lg rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-primary/10 border-b p-4 flex items-center gap-3">
                <div className="bg-primary p-2 rounded-full shadow-sm">
                    <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                    <h2 className="font-bold text-foreground leading-tight">Evaluación Inicial</h2>
                    <p className="text-xs text-muted-foreground">Makito Workout • Personal Trainer IA</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                {messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {m.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-primary-foreground" />
                            </div>
                        )}

                        <div className={`px-4 py-3 rounded-2xl max-w-[85%] ${m.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-card border shadow-sm text-card-foreground rounded-tl-sm'
                            }`}>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
                        </div>

                        {m.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 border">
                                <User className="w-4 h-4 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && !isGeneratingPlan && (
                    <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-primary/50 flex items-center justify-center flex-shrink-0 animate-pulse" />
                        <div className="px-4 py-3 rounded-2xl bg-card border shadow-sm rounded-tl-sm flex items-center gap-1">
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-75" />
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150" />
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-300" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-card border-t">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend() }}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isLoading || isGeneratingPlan}
                        placeholder="Escribe tu respuesta aquí..."
                        className="flex-1 rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow"
                        autoFocus
                    />
                    <Button
                        type="submit"
                        disabled={!inputValue.trim() || isLoading || isGeneratingPlan}
                        size="sm"
                        className="rounded-xl shadow-md p-3"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    )
}

import ChatbotModal from '@/features/coach/components/ChatbotModal'

export default function CoachPage() {
    return (
        <div className="space-y-6 h-full flex flex-col">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">AI Personal Coach</h1>
                <p className="text-muted-foreground mt-2">Your 24/7 fitness and nutrition expert.</p>
            </div>

            <div className="flex-1 max-w-4xl mx-auto w-full">
                <ChatbotModal embedded={true} />
            </div>
        </div>
    )
}

"use client";

import { useState } from "react";
import { generateCoachingResponse } from "@/features/coach/actions";
import { Button } from "@/components/ui/button";
import { MessageSquare, X, Send } from "lucide-react";
import { Card } from "@/components/ui/card"; // Shadcn

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
};

export default function ChatbotModal({ embedded = false }: { embedded?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [tokensLeft, setTokensLeft] = useState<number | null>(null);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: inputValue };
        setMessages((prev) => [...prev, userMsg]);
        setInputValue("");
        setIsLoading(true);

        try {
            const response = await generateCoachingResponse(userMsg.content);
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: response.reply || "No response."
            };
            setMessages((prev) => [...prev, botMsg]);
            if (response.remainingTokens !== undefined) {
                setTokensLeft(response.remainingTokens);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            const errorMsg: Message = {
                id: Date.now().toString(),
                role: "assistant",
                content: "⚠️ Error de conexión con el servidor. Por favor intenta de nuevo."
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ChatInterface
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            messages={messages}
            inputValue={inputValue}
            setInputValue={setInputValue}
            isLoading={isLoading}
            handleSend={handleSend}
            embedded={embedded}
            tokensLeft={tokensLeft}
        />
    );
}

function ChatInterface({
    isOpen,
    setIsOpen,
    messages,
    inputValue,
    setInputValue,
    isLoading,
    handleSend,
    embedded,
    tokensLeft
}: {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    messages: Message[];
    inputValue: string;
    setInputValue: (val: string) => void;
    isLoading: boolean;
    handleSend: () => void;
    embedded: boolean;
    tokensLeft: number | null;
}) {
    if (!embedded && !isOpen) {
        return (
            <Button
                className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50 p-0"
                onClick={() => setIsOpen(true)}
            >
                <MessageSquare className="w-6 h-6" />
            </Button>
        );
    }

    return (
        <Card className={embedded ? "w-full h-[600px] flex flex-col shadow-sm border-border" : "fixed bottom-6 right-6 w-80 md:w-96 h-[500px] flex flex-col shadow-2xl z-50 border-primary/20"}>
            <div className="p-4 bg-primary text-primary-foreground flex justify-between items-center rounded-t-lg">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold">Makito Workout</h3>
                    {tokensLeft !== null && (
                        <span className="bg-primary-foreground/20 text-[10px] px-2 py-0.5 rounded-full font-mono">
                            ⚡ {tokensLeft} Tokens
                        </span>
                    )}
                </div>
                {!embedded && (
                    <Button variant="ghost" onClick={() => setIsOpen(false)} className="text-primary-foreground hover:bg-primary/80 h-8 w-8 p-0">
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center mt-10 space-y-2">
                            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                                <MessageSquare className="w-6 h-6 text-primary" />
                            </div>
                            <p className="text-muted-foreground text-sm">
                                ¡Pregúntame lo que quieras sobre tu entrenamiento o nutrición!
                            </p>
                        </div>
                    )}
                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] p-3 rounded-lg text-sm ${m.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-foreground"
                                    }`}
                            >
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-muted p-3 rounded-lg text-sm italic text-gray-400">
                                Escribiendo...
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 border-t flex gap-2">
                <input
                    className="flex-1 text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                    placeholder="Pregunta sobre sentadillas, nutrición..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    disabled={isLoading}
                    autoFocus
                />
                <Button onClick={handleSend} disabled={isLoading} size="sm">
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </Card>
    );
}

'use client'

import { Button } from '@/components/ui/button'
import { type ComponentProps } from 'react'

type SocialAuthButtonProps = ComponentProps<typeof Button> & {
    provider: 'google' | 'apple'
    onAuth: () => void
}

export function SocialAuthButton({ provider, onAuth, className, ...props }: SocialAuthButtonProps) {
    const isGoogle = provider === 'google'

    return (
        <Button
            variant="outline"
            className={`w-full gap-2 ${className}`}
            onClick={onAuth}
            type="button"
            {...props}
        >
            {isGoogle ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                </svg>
            ) : (
                <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05 1.9-3.26 1.9-.98 0-1.74-.53-2.9-.53-1.15 0-1.87.53-2.94.53-1.15 0-2.31-1-3.37-2.05-2.16-2.14-3.79-5.46-3.79-8.68 0-3.37 2.16-5.12 4.31-5.12 1.1 0 1.84.58 2.58.58.74 0 1.52-.58 2.84-.58 1.15 0 2.26.47 2.94 1.21-2.68 1.15-2.26 4.63.32 5.68-.32 1.68-1.05 3.37-1.89 4.31-.63.74-1.26 1.47-2.05 1.47-.84 0-1.47-.32-2.16-.32 0 0 0 0 0 0zm-3.26-17.79c.53-.63.89-1.47.89-2.37 0-.11 0-.21-.05-.32-.84.05-1.84.58-2.42 1.26-.53.63-.95 1.47-.95 2.37 0 .11 0 .21.05 .32 .84 .05 1.79 -.53 2.47 -1.26z" />
                </svg>
            )}
            <span>Continuar con {isGoogle ? 'Google' : 'Apple'}</span>
        </Button>
    )
}

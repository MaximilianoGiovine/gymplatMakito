import Link from 'next/link'
import { SignupForm } from '@/features/auth/components'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 md:p-8 bg-muted/40 transition-colors">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
            <span className="font-bold text-3xl md:text-4xl text-primary tracking-tight">Gymplat</span>
          </Link>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}

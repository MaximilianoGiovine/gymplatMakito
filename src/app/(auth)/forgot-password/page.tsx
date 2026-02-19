import Link from 'next/link'
import { ForgotPasswordForm } from '@/features/auth/components'

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-bold text-3xl text-primary">Gymplat</span>
          </Link>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}

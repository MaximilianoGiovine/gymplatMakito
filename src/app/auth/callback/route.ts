import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    const host = request.headers.get('host')
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    // Build reliable origin
    let secureOrigin = origin
    if (!isLocalEnv) {
        if (forwardedHost) {
            secureOrigin = `https://${forwardedHost}`
        } else if (host) {
            secureOrigin = `https://${host}`
        }
    }

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${secureOrigin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${secureOrigin}/auth/auth-code-error`)
}

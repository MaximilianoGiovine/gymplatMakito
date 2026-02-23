import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected Routes
  const protectedPaths = ["/dashboard", "/workout", "/coach", "/admin"];
  const isProtectedRoute = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')

  const host = request.headers.get('host')
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'

  let secureOrigin = request.nextUrl.origin
  if (!isLocalEnv) {
    if (forwardedHost) {
      secureOrigin = `https://${forwardedHost}`
    } else if (host) {
      secureOrigin = `https://${host}`
    }
  }

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(`${secureOrigin}/login`)
  }

  // Optional: Redirect to dashboard if already logged in and hitting auth page
  // if (isAuthRoute && user) {
  //   return NextResponse.redirect(`${secureOrigin}/dashboard`)
  // }

  return supabaseResponse
}

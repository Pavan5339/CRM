import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const pathname = request.nextUrl.pathname
  const isAdminPath = pathname.startsWith('/Taskmanager/admin')
  const isDashboardPath = pathname.startsWith('/Taskmanager/dashboard')
  const isHRMPath = pathname.startsWith('/HRM/hrm')
  const isAuditingPath = pathname.startsWith('/Auditing/auditing')

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Admin pages require Supabase auth
  if (!user && isAdminPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Dashboard pages require Supabase auth
  if (!user && isDashboardPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // HRM pages require Supabase auth
  if (!user && isHRMPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is authenticated, check role for admin routes
  if (user && isAdminPath) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/Taskmanager/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated Supabase users away from login page
  if (user && pathname === '/login') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const url = request.nextUrl.clone()
    url.pathname = profile?.role === 'admin' ? '/Taskmanager/admin' : '/Taskmanager/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/Taskmanager/admin/:path*', '/Taskmanager/dashboard/:path*', '/HRM/hrm/:path*', '/Auditing/auditing/:path*', '/login'],
}

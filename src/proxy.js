import { NextResponse } from 'next/server'
import { auth } from './lib/auth-config'

/**
 * Proxy middleware to protect routes based on user roles
 * - GUEST users can only access the home page (/)
 * - ADMIN users can access all pages
 * - Anonymous users can access public pages (/, /games, /about)
 */
export async function proxy(request) {
  const { pathname } = request.nextUrl
  
  // Always allow auth routes
  if (pathname.startsWith('/api/auth/') || pathname.startsWith('/auth/')) {
    return NextResponse.next()
  }
  
  // Always allow API waitlist route (public)
  if (pathname === '/api/waitlist') {
    return NextResponse.next()
  }
  
  // Check authentication (needed for admin and profile checks)
  const session = await auth()
  
  // Admin-only routes (check before general API routes)
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }
  
  // Profile and favorites routes - require authentication
  if (pathname.startsWith('/profile') || pathname.startsWith('/api/favorites')) {
    if (!session) {
      // Redirect to home for profile page, allow API to return 401
      if (pathname.startsWith('/profile')) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      // API will return 401, but we allow the request through
    }
    return NextResponse.next()
  }
  
  // Allow all other API routes for everyone (after specific checks above)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // Public routes - accessible to everyone (anonymous, GUEST, and ADMIN)
  const publicRoutes = ['/', '/games', '/about']
  const isPublicGameDetail = pathname.startsWith('/games/') && pathname !== '/games'
  if (publicRoutes.includes(pathname) || isPublicGameDetail) {
    return NextResponse.next()
  }
  
  // For authenticated GUEST users, allow public routes, home page, profile, and favorites
  if (session && session.user?.role === 'GUEST') {
    const allowedRoutes = ['/', '/profile', '/games', '/about']
    const isAllowedGameDetail = pathname.startsWith('/games/') && pathname !== '/games'
    if (
      !allowedRoutes.includes(pathname) &&
      !isAllowedGameDetail &&
      !pathname.startsWith('/api/favorites')
    ) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }
  
  // Default: allow access (for other API routes, etc.)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}


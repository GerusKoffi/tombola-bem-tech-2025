import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Routes publiques
  const publicRoutes = ["/", "/login", "/register", "/admin-login"]
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    // Routes protégées
    if (["/results", "/participate"].includes(pathname) && !session) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Route admin protégée
    if (pathname.startsWith("/admin") && pathname !== "/admin-login") {
      if (!session || session.user?.email !== "admin@tombola.com") {
        return NextResponse.redirect(new URL("/admin-login", request.url))
      }
    }
  } catch (error) {
    console.error("Middleware error:", error)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

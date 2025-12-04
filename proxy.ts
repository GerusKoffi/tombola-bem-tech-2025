import { type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  return new Response("Proxy configured", { status: 200 })
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

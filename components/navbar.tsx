"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Shield } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      console.log("[v0] Current user:", user)
      setUser(user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("[v0] Auth state changed:", _event, session?.user)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-[#0078b7] flex items-center justify-center text-white font-bold">
            BT
          </div>
          <span className="text-lg font-semibold">BEM TECH 2025</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/participate">
                <Button variant={pathname === "/participate" ? "default" : "ghost"}>Participer</Button>
              </Link>
              <Link href="/results">
                <Button variant={pathname === "/results" ? "default" : "ghost"}>Résultats</Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Connexion</Button>
              </Link>
              <Link href="/register">
                <Button>S'inscrire</Button>
              </Link>
            </>
          )}
          <Link href="/admin-login">
            <Button variant="outline" size="icon" title="Admin">
              <Shield className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

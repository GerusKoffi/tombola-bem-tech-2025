"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Shield, Menu, X } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)

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

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-xl sm:text-2xl font-bold text-primary">Tombola</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition">
              Accueil
            </Link>
            {user ? (
              <>
                <Link href="/results" className="text-sm font-medium hover:text-primary transition">
                  Résultats
                </Link>
                <Button onClick={handleLogout} variant="outline" className="text-sm">
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium hover:text-primary transition">
                  Connexion
                </Link>
                <Link href="/register">
                  <Button className="text-sm">S'inscrire</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100 transition"
            aria-expanded="false"
          >
            <span className="sr-only">Ouvrir menu</span>
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-50 transition"
              onClick={() => setIsOpen(false)}
            >
              Accueil
            </Link>
            {user ? (
              <>
                <Link
                  href="/results"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-50 transition"
                  onClick={() => setIsOpen(false)}
                >
                  Résultats
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-50 transition"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-50 transition"
                  onClick={() => setIsOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-50 transition"
                  onClick={() => setIsOpen(false)}
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

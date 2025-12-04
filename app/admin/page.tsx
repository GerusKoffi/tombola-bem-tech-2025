"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import AdminDashboard from "./admin-dashboard"

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const adminToken =
        typeof window !== "undefined"
          ? localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken")
          : null

      if (!adminToken) {
        router.replace("/admin-login")
      } else {
        setIsAuthenticated(true)
      }
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    sessionStorage.removeItem("adminToken")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div>
      <div className="fixed top-0 right-0 p-4 z-50">
        <Button variant="outline" onClick={handleLogout}>
          Déconnexion
        </Button>
      </div>
      <AdminDashboard />
    </div>
  )
}

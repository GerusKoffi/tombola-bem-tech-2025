"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, ShieldCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const ADMIN_CODE = "Dsa@2025"

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [code, setCode] = useState("")
  const [showCode, setShowCode] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (code === ADMIN_CODE) {
      // Générer un token admin et le stocker
      const adminToken = `admin_token_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`
      localStorage.setItem("adminToken", adminToken)
      sessionStorage.setItem("adminToken", adminToken)

      toast({
        title: "Accès autorisé",
        description: "Bienvenue dans le dashboard admin",
      })

      // Utiliser window.location pour forcer la navigation et charger la page
      window.location.href = "/admin"
    } else {
      toast({
        title: "Accès refusé",
        description: "Code d'accès incorrect",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f59e0b]/5 to-[#0078b7]/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-12 w-12 rounded-full bg-[#f59e0b] flex items-center justify-center text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="text-2xl font-semibold">Admin Access</span>
          </div>
        </div>

        <Card className="border-[#f59e0b]/30">
          <CardHeader>
            <CardTitle className="text-2xl">Accès Administrateur</CardTitle>
            <CardDescription>Entrez le code d'accès pour gérer la tombola</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code d'accès</Label>
                <div className="relative">
                  <Input
                    id="code"
                    type={showCode ? "text" : "password"}
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Entrez le code admin"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() => setShowCode(!showCode)}
                  >
                    {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Vérification..." : "Accéder au Dashboard"}
              </Button>

              <div className="text-center text-sm">
                <Link href="/" className="text-[#0078b7] hover:underline">
                  Retour à l'accueil
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NumberGrid } from "@/components/number-grid"
import { Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [occupiedNumbers, setOccupiedNumbers] = useState<number[]>([])
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    classe: "",
    annee: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    fetchOccupiedNumbers()
  }, [])

  const fetchOccupiedNumbers = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("tickets").select("numero")

    console.log("[v0] Fetched occupied numbers:", { data, error })

    if (!error && data) {
      setOccupiedNumbers(data.map((t) => t.numero))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Register attempt:", { ...formData, password: "***", confirmPassword: "***" })

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      })
      return
    }

    if (!selectedNumber) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un numéro",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      console.log("[v0] Creating user account...")

      // Désactiver la vérification d'email pour le développement
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/results`,
          data: {
            nom: formData.nom,
            prenom: formData.prenom,
            classe: formData.classe,
            annee: formData.annee,
          },
        },
      })

      console.log("[v0] Sign up response:", { authData, authError })

      if (authError) throw authError

      if (authData.user) {
        console.log("[v0] Creating ticket for number:", selectedNumber)
        
        // Créer le ticket avec un délai pour laisser le trigger s'exécuter
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { data: ticketData, error: ticketError } = await supabase
          .from("tickets")
          .insert({
            user_id: authData.user.id,
            numero: selectedNumber,
          })
          .select()

        console.log("[v0] Ticket creation response:", { ticketData, ticketError })

        if (ticketError) throw ticketError

        toast({
          title: "Inscription réussie !",
          description: "Vous pouvez maintenant vous connecter",
        })

        console.log("[v0] Redirecting to login page")
        setTimeout(() => {
          router.push("/login")
        }, 1500)
      }
    } catch (error: any) {
      console.error("[v0] Registration error:", error)
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0078b7]/5 to-[#ff6b35]/5 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-full bg-[#0078b7] flex items-center justify-center text-white font-bold">
              BT
            </div>
            <span className="text-xl font-semibold">BEM TECH 2025</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Inscription à la Tombola</CardTitle>
            <CardDescription>Remplissez le formulaire et choisissez votre numéro porte-bonheur</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section 1: Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-l-4 border-[#0078b7] pl-3">1. Informations Personnelles</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom *</Label>
                    <Input
                      id="prenom"
                      required
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom *</Label>
                    <Input
                      id="nom"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="classe">Classe *</Label>
                    <Select
                      required
                      value={formData.classe}
                      onValueChange={(value) => setFormData({ ...formData, classe: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre classe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ITN">ITN</SelectItem>
                        <SelectItem value="SIT">SIT</SelectItem>
                        <SelectItem value="Licence">Licence</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="annee">Année *</Label>
                    <Select
                      required
                      value={formData.annee}
                      onValueChange={(value) => setFormData({ ...formData, annee: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre année" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1ère année">1ère année</SelectItem>
                        <SelectItem value="2ème année">2ème année</SelectItem>
                        <SelectItem value="3ème année">3ème année</SelectItem>
                        <SelectItem value="4ème année">4ème année</SelectItem>
                        <SelectItem value="5ème année">5ème année</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Section 2: Security */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-l-4 border-[#0078b7] pl-3">2. Sécurité</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Number Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-l-4 border-[#0078b7] pl-3">3. Choisissez votre numéro</h3>
                <NumberGrid
                  selectedNumber={selectedNumber}
                  onSelectNumber={setSelectedNumber}
                  occupiedNumbers={occupiedNumbers}
                />
                {selectedNumber && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">Numéro sélectionné : {selectedNumber}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <Button type="submit" size="lg" disabled={loading}>
                  {loading ? "Inscription en cours..." : "Valider l'inscription"}
                </Button>
                <div className="text-center text-sm">
                  Vous avez déjà un compte ?{" "}
                  <Link href="/login" className="text-[#0078b7] hover:underline font-medium">
                    Se connecter
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

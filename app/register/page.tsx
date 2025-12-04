"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nom: "",
    prenom: "",
    classe: "",
    annee: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        setError("Les mots de passe ne correspondent pas")
        setLoading(false)
        return
      }

      if (formData.password.length < 6) {
        setError("Le mot de passe doit contenir au moins 6 caractères")
        setLoading(false)
        return
      }

      const supabase = createClient()

      // Vérifier si l'email existe déjà
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", formData.email)
        .single()

      if (existingUser) {
        setError("Cet email est déjà utilisé. Veuillez vous connecter.")
        setLoading(false)
        return
      }

      // Créer le compte
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nom: formData.nom,
            prenom: formData.prenom,
            classe: formData.classe,
            annee: formData.annee,
          },
        },
      })

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setError("Cet email est déjà enregistré. Veuillez vous connecter.")
        } else {
          setError(signUpError.message || "Erreur lors de l'inscription")
        }
        setLoading(false)
        return
      }

      if (data.user) {
        // Créer le profil
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            email: formData.email,
            nom: formData.nom,
            prenom: formData.prenom,
            classe: formData.classe,
            annee: formData.annee,
          },
        ])

        if (profileError && profileError.code !== "23505") {
          console.error("Erreur profil:", profileError)
        }

        setSuccess("Inscription réussie! Redirection...")
        setTimeout(() => router.push("/login"), 2000)
      }
    } catch (err: any) {
      console.error("Erreur:", err)
      setError(err.message || "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-center mb-6">S'inscrire</h1>

          {error && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">
                ❌ {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                ✅ {success}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="prenom"
              placeholder="Prénom"
              value={formData.prenom}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="nom"
              placeholder="Nom"
              value={formData.nom}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              name="classe"
              value={formData.classe}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner une classe</option>
              <option value="ITN">ITN</option>
              <option value="SIT">SIT</option>
            </select>
            <select
              name="annee"
              value={formData.annee}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner une année</option>
              <option value="1ère année">1ère année</option>
              <option value="2ème année">2ème année</option>
              <option value="3ème année">3ème année</option>
            </select>
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmer le mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Inscription en cours..." : "S'inscrire"}
            </Button>
          </form>

          <p className="text-center text-sm mt-4">
            Vous avez déjà un compte?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Se connecter
            </a>
          </p>
        </div>
      </Card>
    </div>
  )
}

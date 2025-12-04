"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"

export default function ResultsPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          router.push("/login")
          return
        }

        // Récupérer le profil avec gestion d'erreur
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("nom, prenom, classe, annee")
          .eq("id", user.id)
          .single()

        if (profileError) {
          if (profileError.code === "PGRST116") {
            // Profil n'existe pas, créer un placeholder
            setUserData({
              nom: user.user_metadata?.nom || "Non renseigné",
              prenom: user.user_metadata?.prenom || "Non renseigné",
              classe: user.user_metadata?.classe || "Non renseigné",
              annee: user.user_metadata?.annee || "Non renseigné",
            })
          } else {
            setError("Erreur lors du chargement du profil")
          }
        } else {
          setUserData(profile)
        }
      } catch (err: any) {
        console.error("Erreur:", err)
        setError("Une erreur est survenue")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Chargement...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          ⚠️ {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Mes Résultats</h1>
      {userData ? (
        <Card className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Prénom</p>
              <p className="text-lg font-medium">{userData.prenom}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Nom</p>
              <p className="text-lg font-medium">{userData.nom}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Classe</p>
              <p className="text-lg font-medium">{userData.classe}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Année</p>
              <p className="text-lg font-medium">{userData.annee}</p>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  )
}

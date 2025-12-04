"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface UserTicket {
  numero: number
  winner: boolean
  lot?: string
}

interface UserProfile {
  nom: string
  prenom: string
}

export default function ResultsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [ticket, setTicket] = useState<UserTicket | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Récupérer l'utilisateur connecté
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        // Récupérer le profil
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("nom, prenom")
          .eq("id", user.id)
          .single()

        if (profileError) throw profileError

        setProfile(profileData)

        // Récupérer le ticket
        const { data: ticketData, error: ticketError } = await supabase
          .from("tickets")
          .select("numero, winner, lot")
          .eq("user_id", user.id)
          .single()

        if (ticketError) throw ticketError

        setTicket(ticketData)
      } catch (err: any) {
        console.error("Erreur:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Chargement...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Link href="/">
              <Button className="w-full mt-4">Retour à l'accueil</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Affichage si le user a gagné
  if (ticket?.winner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-4 border-green-500 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
            <CardTitle className="text-4xl text-center">🎉 FÉLICITATIONS! 🎉</CardTitle>
          </CardHeader>
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="space-y-3">
              <p className="text-2xl font-semibold text-gray-800">
                {profile?.prenom} {profile?.nom}
              </p>
              <p className="text-lg text-gray-600">
                Vous avez remporté le lot suivant:
              </p>
            </div>

            {/* Affichage du lot */}
            <div className="bg-gradient-to-r from-yellow-200 to-yellow-100 rounded-lg p-8 my-6">
              <p className="text-5xl mb-3">🎁</p>
              <p className="text-3xl font-bold text-yellow-800">{ticket.lot || "Lot spécial"}</p>
            </div>

            {/* Détails du ticket */}
            <div className="bg-gray-100 rounded-lg p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Numéro gagnant:</span>
                <span className="text-2xl font-bold text-blue-600">{ticket.numero}</span>
              </div>
            </div>

            {/* Boutons */}
            <div className="space-y-3 pt-6">
              <Link href="/">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-lg py-6">
                  Retour à l'accueil
                </Button>
              </Link>
              <Link href="/participate">
                <Button variant="outline" className="w-full text-lg py-6">
                  Participer à nouveau
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Affichage si le user n'a pas gagné
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-3xl text-center">Résultats du tirage</CardTitle>
        </CardHeader>
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="space-y-3">
            <p className="text-2xl font-semibold text-gray-800">
              {profile?.prenom} {profile?.nom}
            </p>
            <p className="text-lg text-gray-600">
              Merci d'avoir participé!
            </p>
          </div>

          {/* Détails du ticket */}
          <div className="bg-blue-50 rounded-lg p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Votre numéro:</span>
              <span className="text-2xl font-bold text-blue-600">{ticket?.numero}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Statut:</span>
              <span className="text-lg font-semibold text-orange-600">En attente du prochain tirage</span>
            </div>
          </div>

          {/* Boutons */}
          <div className="space-y-3 pt-6">
            <Link href="/">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
                Retour à l'accueil
              </Button>
            </Link>
            <Link href="/participate">
              <Button variant="outline" className="w-full text-lg py-6">
                Participer à nouveau
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

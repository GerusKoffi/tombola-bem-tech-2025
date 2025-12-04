"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface Winner {
  numero: number
  lot?: string
  prenom?: string
  nom?: string
  classe?: string
  drawn_at?: string
}

export default function ResultsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWinners()
  }, [])

  const loadWinners = async () => {
    try {
      setLoading(true)

      // Récupérer les tickets gagnants avec les infos utilisateur
      const { data, error } = await supabase
        .from("tickets")
        .select(
          `
          numero,
          lot,
          drawn_at,
          user_id,
          winner
        `
        )
        .eq("winner", true)
        .order("drawn_at", { ascending: false })

      if (error) throw error

      // Enrichir avec les infos utilisateur
      const winnersData = await Promise.all(
        (data || []).map(async (ticket: any) => {
          const { data: user } = await supabase
            .from("profiles")
            .select("prenom, nom, classe")
            .eq("id", ticket.user_id)
            .single()

          return {
            numero: ticket.numero,
            lot: ticket.lot,
            drawn_at: ticket.drawn_at,
            prenom: user?.prenom,
            nom: user?.nom,
            classe: user?.classe,
          }
        })
      )

      setWinners(winnersData)
    } catch (error) {
      console.error("Erreur lors du chargement des résultats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
        <p className="text-white text-2xl">Chargement des résultats...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            ← Retour à l'accueil
          </Button>
        </div>

        <h1 className="text-5xl font-bold text-white text-center mb-4">
          🎰 Résultats du Tirage
        </h1>
        <p className="text-white text-center mb-8 text-lg">
          Découvrez les gagnants de notre tombola!
        </p>

        {winners.length === 0 ? (
          <Card className="bg-white shadow-2xl">
            <CardContent className="p-8 text-center">
              <p className="text-2xl text-gray-600">
                ⏳ Aucun gagnant n'a encore été tiré au sort
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {winners.map((winner, index) => (
              <Card
                key={index}
                className="bg-white shadow-2xl hover:shadow-3xl transition-shadow"
              >
                <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                  <CardTitle className="text-2xl flex items-center justify-between">
                    <span>🎁 Lot #{index + 1}</span>
                    <span className="text-5xl font-black">{winner.numero}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 font-semibold">Participant</p>
                      <p className="text-xl font-bold">
                        {winner.prenom} {winner.nom}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-semibold">Classe</p>
                      <p className="text-xl font-bold">{winner.classe || "N/A"}</p>
                    </div>
                    {winner.lot && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500 font-semibold">Prix</p>
                        <p className="text-2xl font-bold text-green-600">{winner.lot}</p>
                      </div>
                    )}
                    {winner.drawn_at && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500 font-semibold">Date du tirage</p>
                        <p className="text-lg">
                          {new Date(winner.drawn_at).toLocaleString("fr-FR")}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Button
            onClick={() => router.push("/")}
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg"
          >
            ← Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  )
}

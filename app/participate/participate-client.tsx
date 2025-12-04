"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NumberGrid } from "@/components/number-grid"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { User, Ticket } from "@/lib/types"
import { Trophy, Users, TicketIcon } from "lucide-react"

interface ParticipateClientProps {
  profile: User | null
  userTicket: Ticket | null
  occupiedNumbers: number[]
  availableCount: number
}

export function ParticipateClient({ profile, userTicket, occupiedNumbers, availableCount }: ParticipateClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const handleValidate = async () => {
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
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Non authentifié")

      const { error } = await supabase.from("tickets").insert({
        user_id: user.id,
        numero: selectedNumber,
      })

      if (error) throw error

      toast({
        title: "Succès !",
        description: `Votre numéro ${selectedNumber} a été enregistré`,
      })

      router.push("/results")
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer le numéro",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-balance">Participez à la Tombola</h1>
        <p className="text-muted-foreground text-lg">Choisissez votre numéro porte-bonheur</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Grille des numéros</CardTitle>
            </CardHeader>
            <CardContent>
              <NumberGrid
                selectedNumber={selectedNumber}
                onSelectNumber={setSelectedNumber}
                occupiedNumbers={occupiedNumbers}
                userNumber={userTicket?.numero}
                disabled={!!userTicket}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#0078b7]" />
                Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Places libres</span>
                <span className="font-bold text-2xl text-[#0078b7]">{availableCount}/100</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-[#0078b7] h-2 rounded-full transition-all"
                  style={{ width: `${100 - availableCount}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* User Info Card */}
          {profile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#0078b7]" />
                  Vos informations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nom</span>
                  <span className="font-medium">{profile.nom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prénom</span>
                  <span className="font-medium">{profile.prenom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Classe</span>
                  <span className="font-medium">{profile.classe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Année</span>
                  <span className="font-medium">{profile.annee}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Card */}
          <Card>
            <CardContent className="pt-6">
              {userTicket ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <TicketIcon className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="font-medium text-green-800">Votre numéro : {userTicket.numero}</p>
                    <p className="text-sm text-green-600 mt-1">Vous participez déjà à la tombola</p>
                  </div>
                  <Button className="w-full" onClick={() => router.push("/results")}>
                    Voir les résultats
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedNumber && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                      <p className="font-medium text-blue-800">Numéro sélectionné : {selectedNumber}</p>
                    </div>
                  )}
                  <Button className="w-full" size="lg" disabled={!selectedNumber || loading} onClick={handleValidate}>
                    {loading ? "Enregistrement..." : "Valider mon numéro"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

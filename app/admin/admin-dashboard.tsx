"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Participant {
  id: string
  email: string
  nom: string
  prenom: string
  classe: string
  annee: string
  numero: number
  created_at: string
  user_id: string
}

interface DrawSettings {
  id: number
  draw_date: string
  draw_time: string
  updated_at: string
}

interface Winner {
  id: string
  numero: number
  user_id: string
  email: string
  nom: string
  prenom: string
  lot?: string
}

interface Lot {
  id: string
  numero: number
  nom: string
  icon: string
}

export default function AdminDashboard() {
  const { toast } = useToast()
  const supabase = createClient()

  const [participants, setParticipants] = useState<Participant[]>([])
  const [drawSettings, setDrawSettings] = useState<DrawSettings | null>(null)
  const [drawDate, setDrawDate] = useState("")
  const [drawTime, setDrawTime] = useState("")
  const [winners, setWinners] = useState<Winner[]>([])
  const [lots, setLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(true)
  const [newWinnerNumber, setNewWinnerNumber] = useState("")
  const [selectedLot, setSelectedLot] = useState("")

  // Charger les données
  useEffect(() => {
    fetchParticipants()
    fetchDrawSettings()
    fetchWinners()
    fetchLots()
  }, [])

  const fetchParticipants = async () => {
    try {
      const { data: tickets, error: ticketsError } = await supabase
        .from("tickets")
        .select("id, numero, user_id, created_at")
        .order("numero", { ascending: true })

      if (ticketsError) throw ticketsError

      const formatted = await Promise.all(
        (tickets || []).map(async (ticket) => {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("email, nom, prenom, classe, annee")
            .eq("id", ticket.user_id)
            .single()

          if (error) {
            console.error("Error fetching profile for", ticket.user_id, error)
            return {
              id: ticket.id,
              email: "N/A",
              nom: "N/A",
              prenom: "N/A",
              classe: "N/A",
              annee: "N/A",
              numero: ticket.numero,
              created_at: ticket.created_at,
              user_id: ticket.user_id,
            }
          }

          return {
            id: ticket.id,
            email: profile?.email || "N/A",
            nom: profile?.nom || "N/A",
            prenom: profile?.prenom || "N/A",
            classe: profile?.classe || "N/A",
            annee: profile?.annee || "N/A",
            numero: ticket.numero,
            created_at: ticket.created_at,
            user_id: ticket.user_id,
          }
        })
      )

      setParticipants(formatted)
    } catch (error: any) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les participants",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchDrawSettings = async () => {
    try {
      const { data, error } = await supabase.from("draw_settings").select("*").single()
      if (data) {
        setDrawSettings(data)
        setDrawDate(data.draw_date || "")
        setDrawTime(data.draw_time || "")
      }
    } catch (error) {
      console.log("Pas de paramètres de tirage")
    }
  }

  const fetchWinners = async () => {
    try {
      const { data: tickets, error } = await supabase
        .from("tickets")
        .select("id, numero, user_id, lot")
        .eq("winner", true)

      if (error) throw error

      const formatted = await Promise.all(
        (tickets || []).map(async (ticket) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, nom, prenom")
            .eq("id", ticket.user_id)
            .single()

          return {
            id: ticket.id,
            numero: ticket.numero,
            user_id: ticket.user_id,
            email: profile?.email || "N/A",
            nom: profile?.nom || "N/A",
            prenom: profile?.prenom || "N/A",
            lot: ticket.lot || "Non attribué",
          }
        })
      )

      setWinners(formatted)
    } catch (error: any) {
      console.error("Erreur:", error)
    }
  }

  const fetchLots = async () => {
    try {
      const { data, error } = await supabase.from("lots").select("*").order("numero")
      if (error) throw error
      setLots(data || [])
    } catch (error: any) {
      console.error("Erreur:", error)
    }
  }

  const updateDrawSettings = async () => {
    try {
      if (!drawDate || !drawTime) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir la date et l'heure",
          variant: "destructive",
        })
        return
      }

      if (drawSettings) {
        const { error } = await supabase
          .from("draw_settings")
          .update({
            draw_date: drawDate,
            draw_time: drawTime,
            updated_at: new Date().toISOString(),
          })
          .eq("id", drawSettings.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("draw_settings").insert({
          draw_date: drawDate,
          draw_time: drawTime,
        })

        if (error) throw error
      }

      toast({
        title: "Succès",
        description: "Paramètres de tirage mis à jour",
      })

      fetchDrawSettings()
    } catch (error: any) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const addWinner = async () => {
    try {
      const number = parseInt(newWinnerNumber)

      if (!number || number < 1 || number > 100) {
        toast({
          title: "Erreur",
          description: "Veuillez entrer un numéro valide (1-100)",
          variant: "destructive",
        })
        return
      }

      if (!selectedLot) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un lot",
          variant: "destructive",
        })
        return
      }

      const lotName = lots.find((l) => l.numero.toString() === selectedLot)?.nom || null

      const { error } = await supabase
        .from("tickets")
        .update({ winner: true, lot: lotName })
        .eq("numero", number)

      if (error) throw error

      toast({
        title: "Succès",
        description: `Numéro ${number} marqué comme gagnant`,
      })

      setNewWinnerNumber("")
      setSelectedLot("")
      fetchWinners()
      fetchParticipants()
    } catch (error: any) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const randomWinner = async () => {
    try {
      // Récupérer uniquement les numéros qui existent (choisis par les utilisateurs)
      const allNumbers = participants.map((p) => p.numero)
      const nonWinners = allNumbers.filter((n) => !winners.some((w) => w.numero === n))

      if (nonWinners.length === 0) {
        toast({
          title: "Erreur",
          description: "Tous les numéros disponibles sont déjà gagnants!",
          variant: "destructive",
        })
        return
      }

      if (!selectedLot) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un lot",
          variant: "destructive",
        })
        return
      }

      const randomIndex = Math.floor(Math.random() * nonWinners.length)
      const winningNumber = nonWinners[randomIndex]
      const lotName = lots.find((l) => l.numero.toString() === selectedLot)?.nom || null

      const { error } = await supabase
        .from("tickets")
        .update({ winner: true, lot: lotName })
        .eq("numero", winningNumber)

      if (error) throw error

      toast({
        title: "🎉 Tirage au sort!",
        description: `Le numéro gagnant est: ${winningNumber}`,
      })

      setSelectedLot("")
      fetchWinners()
      fetchParticipants()
    } catch (error: any) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const removeWinner = async (numero: number) => {
    try {
      const { error } = await supabase
        .from("tickets")
        .update({ winner: false, lot: null })
        .eq("numero", numero)

      if (error) throw error

      toast({
        title: "Succès",
        description: `Numéro ${numero} retiré des gagnants`,
      })

      fetchWinners()
      fetchParticipants()
    } catch (error: any) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f59e0b]/5 to-[#0078b7]/5 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Dashboard Admin - Tombola</h1>

        <Tabs defaultValue="participants" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="participants">Participants ({participants.length})</TabsTrigger>
            <TabsTrigger value="draw">Tirage au Sort</TabsTrigger>
            <TabsTrigger value="winners">Gagnants ({winners.length})</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          {/* Onglet Participants */}
          <TabsContent value="participants">
            <Card>
              <CardHeader>
                <CardTitle>Liste des Participants</CardTitle>
                <CardDescription>
                  {participants.length} participant(s) inscrit(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="text-sm">
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="font-bold">Numéro</TableHead>
                        <TableHead className="font-bold">Nom</TableHead>
                        <TableHead className="font-bold">Prénom</TableHead>
                        <TableHead className="font-bold">Email</TableHead>
                        <TableHead className="font-bold">Classe</TableHead>
                        <TableHead className="font-bold">Année</TableHead>
                        <TableHead className="font-bold text-center">Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {participants.map((p) => (
                        <TableRow key={p.id} className="hover:bg-gray-50">
                          <TableCell className="font-bold text-lg text-blue-600">{p.numero}</TableCell>
                          <TableCell className="font-medium">{p.nom}</TableCell>
                          <TableCell>{p.prenom}</TableCell>
                          <TableCell className="text-xs text-gray-600 max-w-xs truncate" title={p.email}>
                            {p.email}
                          </TableCell>
                          <TableCell className="text-sm">{p.classe}</TableCell>
                          <TableCell className="text-sm">{p.annee}</TableCell>
                          <TableCell className="text-center">
                            {winners.some((w) => w.numero === p.numero) ? (
                              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                🎉 Gagnant
                              </span>
                            ) : (
                              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                En attente
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Carte résumé */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-gray-600 text-sm">Total Participants</p>
                      <p className="text-2xl font-bold text-blue-600">{participants.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-gray-600 text-sm">Gagnants</p>
                      <p className="text-2xl font-bold text-green-600">{winners.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-gray-600 text-sm">En attente</p>
                      <p className="text-2xl font-bold text-orange-600">{participants.length - winners.length}</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Tirage au Sort */}
          <TabsContent value="draw">
            <Card>
              <CardHeader>
                <CardTitle>Gestion du Tirage au Sort</CardTitle>
                <CardDescription>Sélectionnez les numéros gagnants et les lots</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tirage manuel */}
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">Tirage Manual</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="lot-select">Sélectionnez un lot</Label>
                        <Select value={selectedLot} onValueChange={setSelectedLot}>
                          <SelectTrigger id="lot-select">
                            <SelectValue placeholder="Choisir un lot" />
                          </SelectTrigger>
                          <SelectContent>
                            {lots.map((lot) => (
                              <SelectItem key={lot.id} value={lot.numero.toString()}>
                                {lot.icon} {lot.nom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="winner-number">Numéro gagnant</Label>
                        <div className="flex gap-2">
                          <Input
                            id="winner-number"
                            type="number"
                            min="1"
                            max="100"
                            placeholder="Entrez un numéro (1-100)"
                            value={newWinnerNumber}
                            onChange={(e) => setNewWinnerNumber(e.target.value)}
                          />
                          <Button onClick={addWinner} disabled={!selectedLot || !newWinnerNumber}>
                            Ajouter
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tirage automatique */}
                  <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-blue-50">
                    <h3 className="font-semibold text-lg">🎲 Tirage Aléatoire</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="random-lot">Sélectionnez un lot</Label>
                        <Select value={selectedLot} onValueChange={setSelectedLot}>
                          <SelectTrigger id="random-lot">
                            <SelectValue placeholder="Choisir un lot" />
                          </SelectTrigger>
                          <SelectContent>
                            {lots.map((lot) => (
                              <SelectItem key={lot.id} value={lot.numero.toString()}>
                                {lot.icon} {lot.nom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-sm text-gray-600">
                        Tire aléatoirement parmi les numéros choisis par les utilisateurs
                      </p>
                      <Button
                        onClick={randomWinner}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        disabled={!selectedLot}
                      >
                        Lancer le Tirage Aléatoire
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Gagnants */}
          <TabsContent value="winners">
            <Card>
              <CardHeader>
                <CardTitle>Numéros Gagnants</CardTitle>
                <CardDescription>{winners.length} numéro(s) gagnant(s)</CardDescription>
              </CardHeader>
              <CardContent>
                {winners.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Aucun gagnant pour le moment</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="text-sm">
                      <TableHeader>
                        <TableRow className="bg-green-50">
                          <TableHead className="font-bold">Numéro</TableHead>
                          <TableHead className="font-bold">Nom</TableHead>
                          <TableHead className="font-bold">Prénom</TableHead>
                          <TableHead className="font-bold">Email</TableHead>
                          <TableHead className="font-bold">Lot Attribué</TableHead>
                          <TableHead className="font-bold text-center">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {winners.map((w) => (
                          <TableRow key={w.id} className="bg-green-50 hover:bg-green-100">
                            <TableCell className="font-bold text-lg">🎉 {w.numero}</TableCell>
                            <TableCell className="font-medium">{w.nom}</TableCell>
                            <TableCell>{w.prenom}</TableCell>
                            <TableCell className="text-xs text-gray-600 max-w-xs truncate" title={w.email}>
                              {w.email}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {lots.find((l) => l.nom === w.lot)?.icon} {w.lot}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                onClick={() => removeWinner(w.numero)}
                                variant="destructive"
                                size="sm"
                              >
                                Retirer
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Paramètres */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de la Tombola</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg">📅 Date et Heure du Tirage</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="draw-date">Date du tirage</Label>
                      <Input
                        id="draw-date"
                        type="date"
                        value={drawDate}
                        onChange={(e) => setDrawDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="draw-time">Heure du tirage</Label>
                      <Input
                        id="draw-time"
                        type="time"
                        value={drawTime}
                        onChange={(e) => setDrawTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={updateDrawSettings} className="w-full">
                    Enregistrer les Paramètres
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600">Participants inscrits</p>
                      <p className="text-3xl font-bold">{participants.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600">Gagnants désignés</p>
                      <p className="text-3xl font-bold text-green-600">{winners.length}</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DrawSettings {
  draw_date: string
  draw_time: string
  is_active: boolean
}

interface User {
  id: string
  email: string
  nom?: string
  prenom?: string
  classe?: string
  annee?: string
}

interface Ticket {
  id: string
  numero: number
  user_id: string
  winner: boolean
  lot?: string
  drawn_at?: string
  users?: User
}

const PREDEFINED_LOTS = [
  "iPhone 15",
  "iPad Air",
  "AirPods Pro",
  "Apple Watch",
  "MacBook Air M3",
  "100€ Bon d'achat",
  "Casque Sony WH-1000XM5",
  "Powerbank 20000mAh",
  "Montre Smartwatch",
  "Enceinte Bluetooth Premium"
]

export default function AdminDashboard() {
  const supabase = createClient()
  const [drawSettings, setDrawSettings] = useState<DrawSettings>({
    draw_date: "",
    draw_time: "",
    is_active: false,
  })
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [users, setUsers] = useState<{ [key: string]: User }>({})
  const [loading, setLoading] = useState(true)
  const [drawnNumber, setDrawnNumber] = useState<number | null>(null)
  const [selectedLot, setSelectedLot] = useState("")
  const [manualMode, setManualMode] = useState(false)
  const [selectedManualNumber, setSelectedManualNumber] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      const { data: ticketsData, error: ticketsError } = await supabase
        .from("tickets")
        .select("*")
        .order("numero", { ascending: true })

      if (ticketsError) throw ticketsError
      setTickets(ticketsData || [])

      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("id, email, nom, prenom, classe, annee")

      if (usersError) throw usersError

      const usersMap: { [key: string]: User } = {}
      usersData?.forEach((user: User) => {
        usersMap[user.id] = user
      })
      setUsers(usersMap)

      const savedSettings = localStorage.getItem("drawSettings")
      if (savedSettings) {
        setDrawSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveDrawSettings = () => {
    localStorage.setItem("drawSettings", JSON.stringify(drawSettings))
    alert("Paramètres de tirage sauvegardés!")
  }

  const drawRandomNumber = async () => {
    const undrawnTickets = tickets.filter((t) => !t.winner)
    if (undrawnTickets.length === 0) {
      alert("Tous les tickets ont déjà été tirés!")
      return
    }

    if (!selectedLot) {
      alert("Veuillez sélectionner un lot!")
      return
    }

    const randomIndex = Math.floor(Math.random() * undrawnTickets.length)
    const winningTicket = undrawnTickets[randomIndex]

    await updateTicketAsWinner(winningTicket.id, selectedLot)
  }

  const drawManualNumber = async () => {
    if (!selectedManualNumber) {
      alert("Veuillez sélectionner un numéro!")
      return
    }

    if (!selectedLot) {
      alert("Veuillez sélectionner un lot!")
      return
    }

    const ticket = tickets.find(
      (t) => t.numero === parseInt(selectedManualNumber) && !t.winner
    )
    if (!ticket) {
      alert("Ce numéro n'existe pas ou a déjà été tiré!")
      return
    }

    await updateTicketAsWinner(ticket.id, selectedLot)
    setSelectedManualNumber("")
  }

  const updateTicketAsWinner = async (ticketId: string, lot: string) => {
    try {
      const { error } = await supabase
        .from("tickets")
        .update({
          winner: true,
          drawn_at: new Date().toISOString(),
          lot: lot,
        })
        .eq("id", ticketId)

      if (error) throw error

      const winningTicket = tickets.find((t) => t.id === ticketId)
      if (winningTicket) {
        setDrawnNumber(winningTicket.numero)
      }
      setSelectedLot("")
      loadData()
    } catch (error) {
      console.error("Erreur lors de la mise à jour du ticket:", error)
      alert("Erreur lors du tirage")
    }
  }

  const resetDraw = async () => {
    if (!confirm("Êtes-vous sûr de vouloir réinitialiser tous les tirages? Cette action est irréversible!")) {
      return
    }

    try {
      const { error } = await supabase
        .from("tickets")
        .update({
          winner: false,
          drawn_at: null,
          lot: null,
        })
        .eq("winner", true)

      if (error) throw error

      setDrawnNumber(null)
      setSelectedLot("")
      alert("Tous les tirages ont été réinitialisés!")
      loadData()
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error)
      alert("Erreur lors de la réinitialisation")
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>
  }

  const winners = tickets.filter((t) => t.winner)
  const totalTickets = tickets.length
  const undrawnTickets = tickets.filter((t) => !t.winner)
  const availableLots = PREDEFINED_LOTS.filter(
    (lot) => !winners.some((w) => w.lot === lot)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-black text-white text-center mb-2">
          🎰 Tableau de Bord Admin
        </h1>
        <p className="text-white text-center mb-8 text-lg">Gérez les tirages au sort</p>

        {/* Paramètres de tirage */}
        <Card className="mb-8 bg-white shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardTitle>⚙️ Paramètres de Tirage</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="draw_date" className="font-semibold">
                  Date du tirage
                </Label>
                <Input
                  id="draw_date"
                  type="date"
                  value={drawSettings.draw_date}
                  onChange={(e) =>
                    setDrawSettings({ ...drawSettings, draw_date: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="draw_time" className="font-semibold">
                  Heure du tirage
                </Label>
                <Input
                  id="draw_time"
                  type="time"
                  value={drawSettings.draw_time}
                  onChange={(e) =>
                    setDrawSettings({ ...drawSettings, draw_time: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
            </div>
            <Button onClick={saveDrawSettings} className="w-full bg-blue-600 hover:bg-blue-700">
              💾 Sauvegarder les paramètres
            </Button>
          </CardContent>
        </Card>

        {/* Mode de tirage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Tirage Automatique */}
          <Card className="bg-white shadow-2xl border-2 border-green-500">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <CardTitle>🎲 Tirage Automatique</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="text-sm text-gray-600 bg-green-50 p-3 rounded">
                ✓ L'ordinateur sélectionne aléatoirement parmi les numéros disponibles
              </div>

              <div>
                <Label className="font-semibold">Sélectionnez un lot</Label>
                <Select value={selectedLot} onValueChange={setSelectedLot}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choisir un lot..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLots.map((lot) => (
                      <SelectItem key={lot} value={lot}>
                        {lot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={drawRandomNumber}
                disabled={undrawnTickets.length === 0 || !selectedLot}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                🎰 Tirer un numéro au sort
              </Button>

              {undrawnTickets.length === 0 && (
                <p className="text-center text-red-600 font-semibold">
                  ⚠️ Tous les tickets ont été tirés!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tirage Manuel */}
          <Card className="bg-white shadow-2xl border-2 border-orange-500">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
              <CardTitle>✋ Tirage Manuel</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="text-sm text-gray-600 bg-orange-50 p-3 rounded">
                ✓ Vous choisissez directement le numéro gagnant et son lot
              </div>

              <div>
                <Label className="font-semibold">Sélectionnez un numéro</Label>
                <Select value={selectedManualNumber} onValueChange={setSelectedManualNumber}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choisir un numéro..." />
                  </SelectTrigger>
                  <SelectContent>
                    {undrawnTickets.map((ticket) => (
                      <SelectItem key={ticket.id} value={ticket.numero.toString()}>
                        N° {ticket.numero}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="font-semibold">Sélectionnez un lot</Label>
                <Select value={selectedLot} onValueChange={setSelectedLot}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choisir un lot..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLots.map((lot) => (
                      <SelectItem key={lot} value={lot}>
                        {lot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={drawManualNumber}
                disabled={!selectedManualNumber || !selectedLot}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
              >
                ✅ Confirmer ce tirage
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Dernier tirage */}
        {drawnNumber !== null && (
          <Card className="mb-8 bg-gradient-to-r from-yellow-300 to-yellow-100 shadow-2xl border-2 border-yellow-500">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-yellow-700 font-semibold">Numéro tiré au sort:</p>
              <p className="text-6xl font-black text-yellow-600">{drawnNumber}</p>
              {selectedLot && (
                <p className="text-2xl font-bold text-yellow-700 mt-2">🎁 {selectedLot}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Bouton Réinitialiser */}
        <div className="mb-8">
          <Button
            onClick={resetDraw}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-bold"
          >
            🔄 Réinitialiser tous les tirages
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white shadow-2xl">
            <CardHeader className="bg-blue-100">
              <CardTitle className="text-sm">📊 Total Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{totalTickets}</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-2xl">
            <CardHeader className="bg-green-100">
              <CardTitle className="text-sm">✅ Gagnants</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{winners.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-2xl">
            <CardHeader className="bg-orange-100">
              <CardTitle className="text-sm">⏳ Restants</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{undrawnTickets.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des gagnants */}
        <Card className="bg-white shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <CardTitle>👑 Gagnants du Tirage</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {winners.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Aucun gagnant pour le moment</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="font-bold">Numéro</TableHead>
                      <TableHead className="font-bold">Participant</TableHead>
                      <TableHead className="font-bold">Classe</TableHead>
                      <TableHead className="font-bold">🎁 Lot</TableHead>
                      <TableHead className="font-bold">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {winners.map((ticket) => {
                      const user = users[ticket.user_id]
                      return (
                        <TableRow key={ticket.id} className="bg-green-50 hover:bg-green-100">
                          <TableCell className="font-bold text-lg text-green-600">
                            {ticket.numero}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {user ? `${user.prenom} ${user.nom}` : "N/A"}
                          </TableCell>
                          <TableCell>{user?.classe || "N/A"}</TableCell>
                          <TableCell className="font-bold text-green-600">
                            {ticket.lot || "-"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {ticket.drawn_at
                              ? new Date(ticket.drawn_at).toLocaleString("fr-FR")
                              : "-"}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Liste des tickets disponibles */}
        <Card className="mt-8 bg-white shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardTitle>📋 Tickets Disponibles ({undrawnTickets.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="font-bold">Numéro</TableHead>
                    <TableHead className="font-bold">Participant</TableHead>
                    <TableHead className="font-bold">Classe</TableHead>
                    <TableHead className="font-bold">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {undrawnTickets.map((ticket) => {
                    const user = users[ticket.user_id]
                    return (
                      <TableRow key={ticket.id} className="hover:bg-blue-50">
                        <TableCell className="font-bold text-blue-600">
                          {ticket.numero}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {user ? `${user.prenom} ${user.nom}` : "N/A"}
                        </TableCell>
                        <TableCell>{user?.classe || "N/A"}</TableCell>
                        <TableCell>
                          <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded font-semibold">
                            ⏳ En attente
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

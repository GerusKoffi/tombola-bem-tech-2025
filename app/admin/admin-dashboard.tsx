"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Charger les tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from("tickets")
        .select("*")
        .order("numero", { ascending: true })

      if (ticketsError) throw ticketsError
      setTickets(ticketsData || [])

      // Charger les utilisateurs
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("id, email, nom, prenom, classe, annee")

      if (usersError) throw usersError

      const usersMap: { [key: string]: User } = {}
      usersData?.forEach((user: User) => {
        usersMap[user.id] = user
      })
      setUsers(usersMap)

      // Charger les paramètres de tirage depuis localStorage ou Supabase
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
    if (tickets.length === 0) {
      alert("Aucun ticket disponible")
      return
    }

    const undrawnTickets = tickets.filter((t) => !t.winner)
    if (undrawnTickets.length === 0) {
      alert("Tous les tickets ont déjà été tirés!")
      return
    }

    const randomIndex = Math.floor(Math.random() * undrawnTickets.length)
    const winningTicket = undrawnTickets[randomIndex]

    setDrawnNumber(winningTicket.numero)

    // Mettre à jour le ticket comme gagnant
    const { error } = await supabase
      .from("tickets")
      .update({
        winner: true,
        drawn_at: new Date().toISOString(),
        lot: selectedLot || null,
      })
      .eq("id", winningTicket.id)

    if (error) {
      console.error("Erreur lors de la mise à jour du ticket:", error)
      return
    }

    // Recharger les données
    loadData()
  }

  const undoLastDraw = async () => {
    if (drawnNumber === null) return

    const ticketToUndo = tickets.find((t) => t.numero === drawnNumber)
    if (!ticketToUndo) return

    const { error } = await supabase
      .from("tickets")
      .update({
        winner: false,
        drawn_at: null,
        lot: null,
      })
      .eq("id", ticketToUndo.id)

    if (error) {
      console.error("Erreur lors de l'annulation:", error)
      return
    }

    setDrawnNumber(null)
    setSelectedLot("")
    loadData()
  }

  if (loading) {
    return <div className="p-8">Chargement...</div>
  }

  const winners = tickets.filter((t) => t.winner)
  const totalTickets = tickets.length

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🎰 Tableau de Bord Admin</h1>

        {/* Paramètres de tirage */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>⚙️ Paramètres de Tirage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="draw_date">Date du tirage</Label>
                <Input
                  id="draw_date"
                  type="date"
                  value={drawSettings.draw_date}
                  onChange={(e) =>
                    setDrawSettings({ ...drawSettings, draw_date: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="draw_time">Heure du tirage</Label>
                <Input
                  id="draw_time"
                  type="time"
                  value={drawSettings.draw_time}
                  onChange={(e) =>
                    setDrawSettings({ ...drawSettings, draw_time: e.target.value })
                  }
                />
              </div>
            </div>
            <Button onClick={saveDrawSettings} className="w-full">
              Sauvegarder les paramètres
            </Button>
          </CardContent>
        </Card>

        {/* Section Tirage */}
        <Card className="mb-8 border-2 border-blue-500">
          <CardHeader>
            <CardTitle>🎲 Tirage au Sort</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="lot">Lot à attribuer</Label>
              <Input
                id="lot"
                placeholder="Ex: iPhone, 100€, Voyage..."
                value={selectedLot}
                onChange={(e) => setSelectedLot(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Button onClick={drawRandomNumber} className="flex-1 bg-green-600 hover:bg-green-700">
                Tirer un numéro
              </Button>
              <Button onClick={undoLastDraw} variant="outline" className="flex-1">
                Annuler le dernier tirage
              </Button>
            </div>

            {drawnNumber !== null && (
              <div className="bg-yellow-100 border-2 border-yellow-500 p-4 rounded text-center">
                <p className="text-sm text-gray-600">Numéro tiré au sort:</p>
                <p className="text-5xl font-bold text-yellow-600">{drawnNumber}</p>
                {selectedLot && <p className="text-lg mt-2">🎁 Lot: {selectedLot}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{totalTickets}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Gagnants</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{winners.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Restants</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{totalTickets - winners.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des gagnants */}
        <Card>
          <CardHeader>
            <CardTitle>👑 Gagnants du Tirage</CardTitle>
          </CardHeader>
          <CardContent>
            {winners.length === 0 ? (
              <p className="text-gray-500">Aucun gagnant pour le moment</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Classe</TableHead>
                    <TableHead>Lot</TableHead>
                    <TableHead>Date de tirage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {winners.map((ticket) => {
                    const user = users[ticket.user_id]
                    return (
                      <TableRow key={ticket.id} className="bg-green-50">
                        <TableCell className="font-bold text-lg">{ticket.numero}</TableCell>
                        <TableCell>{user ? `${user.prenom} ${user.nom}` : "N/A"}</TableCell>
                        <TableCell>{user?.classe || "N/A"}</TableCell>
                        <TableCell>{ticket.lot || "-"}</TableCell>
                        <TableCell>
                          {ticket.drawn_at
                            ? new Date(ticket.drawn_at).toLocaleString("fr-FR")
                            : "-"}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Liste complète des tickets */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📋 Tous les Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => {
                  const user = users[ticket.user_id]
                  return (
                    <TableRow
                      key={ticket.id}
                      className={ticket.winner ? "bg-green-100" : ""}
                    >
                      <TableCell className="font-bold">{ticket.numero}</TableCell>
                      <TableCell>{user ? `${user.prenom} ${user.nom}` : "N/A"}</TableCell>
                      <TableCell>{user?.classe || "N/A"}</TableCell>
                      <TableCell>
                        {ticket.winner ? (
                          <span className="bg-green-200 text-green-800 px-3 py-1 rounded">
                            ✅ Gagnant
                          </span>
                        ) : (
                          <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded">
                            En attente
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

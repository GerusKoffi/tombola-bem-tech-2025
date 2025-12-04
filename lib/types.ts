export interface User {
  id: string
  email: string
  nom: string
  prenom: string
  classe: string
  annee: string
  created_at?: string
  updated_at?: string
}

export interface Ticket {
  id: string
  user_id: string
  numero: number
  winner: boolean
  lot?: string
  drawn_at?: string
  created_at: string
}

export interface Lot {
  id: string
  numero: number
  nom: string
  icon?: string
  created_at: string
}

export interface DrawSettings {
  id: number
  draw_date: string
  draw_time: string
  updated_at: string
}

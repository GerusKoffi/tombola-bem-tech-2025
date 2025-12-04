import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { ParticipateClient } from "./participate-client"

export default async function ParticipatePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user's ticket if exists
  const { data: userTicket } = await supabase.from("tickets").select("*").eq("user_id", user.id).single()

  // Get all occupied numbers
  const { data: tickets } = await supabase.from("tickets").select("numero")
  const occupiedNumbers = tickets?.map((t) => t.numero) || []

  // Get available count
  const availableCount = 100 - occupiedNumbers.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0078b7]/5 to-[#ff6b35]/5">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <ParticipateClient
          profile={profile}
          userTicket={userTicket}
          occupiedNumbers={occupiedNumbers}
          availableCount={availableCount}
        />
      </div>
    </div>
  )
}

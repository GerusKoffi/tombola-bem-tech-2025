"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Navbar } from "@/components/navbar"
import { Countdown3D } from "@/components/countdown-3d"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { ArrowRight, Trophy, Ticket, Clock, Gift, ChevronUp } from "lucide-react"

interface DrawSettings {
  draw_date: string
  draw_time: string
  is_active: boolean
}

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [drawSettings, setDrawSettings] = useState<DrawSettings | null>(null)
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    // Charger les paramètres de tirage depuis localStorage
    const savedSettings = localStorage.getItem("drawSettings")
    if (savedSettings) {
      setDrawSettings(JSON.parse(savedSettings))
    }
  }, [])

  useEffect(() => {
    if (!drawSettings) return

    const timer = setInterval(() => {
      const targetDateTime = new Date(
        `${drawSettings.draw_date}T${drawSettings.draw_time}`
      ).getTime()
      const now = new Date().getTime()
      const difference = targetDateTime - now

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference / (1000 * 60 * 60)) % 24
          ),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [drawSettings])

  if (loading) {
    return <div className="p-8">Chargement...</div>
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0078b7] via-[#005a87] to-[#0078b7] text-white py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">Soutenez Fatima DIAKITE</h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90">
                Participez à notre tombola et tentez de gagner l'un des 12 lots exceptionnels
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="gap-2">
                    Participer maintenant <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/30"
                >
                  Comment jouer ?
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-3xl font-bold">12</div>
                  <div className="text-sm text-white/80">Lots à gagner</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-3xl font-bold">100</div>
                  <div className="text-sm text-white/80">Places disponibles</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl bg-white/10 backdrop-blur-sm border-4 border-white/20 overflow-hidden">
                <img src="/professional-portrait-of-a-female-student-leader.jpg" alt="Fatima DIAKITE" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <Countdown3D />

      {/* How to Play Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-balance">Comment participer ?</h2>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            <StepCard
              number="1"
              icon={<Ticket className="h-8 w-8" />}
              title="S'inscrire"
              description="Créez votre compte en quelques clics"
            />
            <StepCard
              number="2"
              icon={<Trophy className="h-8 w-8" />}
              title="Choisir votre numéro"
              description="Sélectionnez un numéro entre 1 et 100"
            />
            <StepCard
              number="3"
              icon={<Gift className="h-8 w-8" />}
              title="Confirmer"
              description="Validez votre participation"
            />
            <StepCard
              number="4"
              icon={<Clock className="h-8 w-8" />}
              title="Attendre le tirage"
              description="Le tirage aura lieu le 15 janvier"
            />
            <StepCard
              number="5"
              icon={<Trophy className="h-8 w-8" />}
              title="Gagnez"
              description="Découvrez si vous avez gagné"
            />
          </div>

          <div className="text-center mt-12">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Je m'inscris maintenant <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Prizes Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-balance">Les lots à gagner</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <PrizeCard icon="🎧" title="AirPods" number={1} highlight />
            <PrizeCard icon="📚" title="Bons d'achat Librairies de France" number={2} />
            <PrizeCard icon="🎵" title="Abonnement Spotify 6 mois" number={3} />
            <PrizeCard icon="💬" title="Abonnement Snapchat+" number={4} />
            <PrizeCard icon="💄" title="Paquet beauté pour fille (Gloss, etc)" number={5} />
            <PrizeCard icon="💐" title="Parfum de luxe" number={6} />
            <PrizeCard icon="⌚" title="Montre élégante" number={7} />
            <PrizeCard icon="👜" title="Accessoires mode" number={8} />
            <PrizeCard icon="🎒" title="Sac à dos premium" number={9} />
            <PrizeCard icon="🔋" title="Power bank" number={10} />
            <PrizeCard icon="📱" title="Coque téléphone premium" number={11} />
            <PrizeCard icon="🎁" title="Carte cadeau 100€" number={12} highlight />
            </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-[#0078b7] to-[#005a87] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">Prêt à tenter votre chance ?</h2>
          <p className="text-xl mb-8 text-white/90">
            Ne manquez pas cette opportunité de gagner des lots exceptionnels
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="gap-2">
                S'inscrire maintenant
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/30"
              >
                J'ai déjà un compte
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2025 Tombola BEM TECH - Campagne Fatima DIAKITE</p>
        </div>
      </footer>

      {/* Back to Top Button */}
      <BackToTop />

      {/* Countdown */}
      {drawSettings && (
        <Card className="bg-white shadow-2xl mb-12 overflow-hidden">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-center mb-6">
              ⏳ Tirage au sort dans...
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Jours", value: countdown.days },
                { label: "Heures", value: countdown.hours },
                { label: "Minutes", value: countdown.minutes },
                { label: "Secondes", value: countdown.seconds },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg p-4 mb-2">
                    <p className="text-4xl font-black text-white">
                      {String(item.value).padStart(2, "0")}
                    </p>
                  </div>
                  <p className="text-gray-600 font-semibold">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-600 mt-6">
              Tirage le {new Date(`${drawSettings.draw_date}T${drawSettings.draw_time}`).toLocaleString("fr-FR")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* CTA Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {!user ? (
          <>
            <Link href="/register" className="block">
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white py-6 text-lg font-bold">
                📝 S'inscrire
              </Button>
            </Link>
            <Link href="/login" className="block">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6 text-lg font-bold">
                🔓 Se connecter
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link href="/participate" className="block">
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg font-bold">
                🎲 Participer
              </Button>
            </Link>
            <Link href="/results" className="block">
              <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-6 text-lg font-bold">
                📊 Résultats
              </Button>
            </Link>
          </>
        )}
        <Link href="/admin" className="block">
          <Button className="w-full bg-red-500 hover:bg-red-600 text-white py-6 text-lg font-bold">
            ⚙️ Admin
          </Button>
        </Link>
      </div>

      {/* Info Card */}
      <Card className="bg-white shadow-2xl">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold mb-4">ℹ️ Comment participer?</h3>
          <ol className="space-y-3 text-gray-700">
            <li>✅ <strong>Inscrivez-vous</strong> sur le site</li>
            <li>✅ <strong>Choisissez un numéro</strong> de 1 à 100</li>
            <li>✅ <strong>Attendez le tirage</strong> au sort</li>
            <li>✅ <strong>Gagnez des lots</strong> fabuleux!</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}

function StepCard({
  number,
  icon,
  title,
  description,
}: {
  number: string
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="relative">
      <div className="absolute -top-4 -left-4 w-10 h-10 bg-[#0078b7] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
        {number}
      </div>
      <CardContent className="pt-8 pb-6">
        <div className="text-[#0078b7] mb-3 flex justify-center">{icon}</div>
        <h3 className="font-semibold text-lg mb-2 text-center">{title}</h3>
        <p className="text-sm text-muted-foreground text-center leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}

function PrizeCard({
  icon,
  title,
  number,
  highlight = false,
}: {
  icon: string
  title: string
  number: number
  highlight?: boolean
}) {
  return (
    <Card className={highlight ? "border-[#ff6b35] border-2 shadow-lg" : ""}>
      <CardContent className="p-6 text-center">
        <div className="text-5xl mb-3">{icon}</div>
        <h3 className="font-semibold mb-2 text-balance">{title}</h3>
        <div className="text-sm text-muted-foreground">Lot #{number}</div>
        {highlight && (
          <div className="mt-3 inline-block bg-[#ff6b35] text-white text-xs px-3 py-1 rounded-full font-medium">
            GRAND PRIX
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function BackToTop() {
  return (
    <Button
      size="icon"
      className="fixed bottom-8 right-8 rounded-full shadow-lg"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <ChevronUp className="h-5 w-5" />
    </Button>
  )
}

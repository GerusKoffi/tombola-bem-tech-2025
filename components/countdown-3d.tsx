"use client"

import { useEffect, useState } from "react"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function Countdown3D() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    // Default draw date
    const drawDate = new Date("2025-01-15T14:30:00")

    const calculateTimeLeft = () => {
      const difference = drawDate.getTime() - new Date().getTime()

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        }
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="py-16 bg-gradient-to-br from-[#0078b7]/5 to-[#ff6b35]/5">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-balance">Tirage au sort dans</h2>

        <div className="grid grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
          <TimeBox value={timeLeft.days} label="Jours" />
          <TimeBox value={timeLeft.hours} label="Heures" />
          <TimeBox value={timeLeft.minutes} label="Minutes" />
          <TimeBox value={timeLeft.seconds} label="Secondes" />
        </div>
      </div>
    </div>
  )
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-gradient-to-br from-[#0078b7] to-[#005a87] rounded-xl p-4 md:p-8 shadow-2xl transform hover:scale-105 transition-transform w-full">
        <div className="text-4xl md:text-6xl font-bold text-white text-center">{String(value).padStart(2, "0")}</div>
      </div>
      <div className="mt-2 text-sm md:text-base font-medium text-muted-foreground">{label}</div>
    </div>
  )
}

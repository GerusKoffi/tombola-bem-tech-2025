"use client"

import { cn } from "@/lib/utils"

interface NumberGridProps {
  selectedNumber: number | null
  onSelectNumber: (num: number) => void
  occupiedNumbers: number[]
  userNumber?: number
  disabled?: boolean
}

export function NumberGrid({
  selectedNumber,
  onSelectNumber,
  occupiedNumbers,
  userNumber,
  disabled = false,
}: NumberGridProps) {
  const numbers = Array.from({ length: 100 }, (_, i) => i + 1)

  const getNumberStatus = (num: number) => {
    if (userNumber === num) return "user"
    if (selectedNumber === num) return "selected"
    if (occupiedNumbers.includes(num)) return "occupied"
    return "available"
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-10 gap-2 max-h-96 overflow-y-auto p-2">
        {numbers.map((num) => {
          const status = getNumberStatus(num)

          return (
            <button
              key={num}
              onClick={() => !disabled && status === "available" && onSelectNumber(num)}
              disabled={disabled || status === "occupied" || status === "user"}
              className={cn(
                "aspect-square rounded-lg font-semibold text-sm transition-all hover:scale-105",
                status === "available" && "bg-[#0078b7] text-white hover:bg-[#005a87] cursor-pointer",
                status === "occupied" && "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50",
                status === "selected" && "bg-green-500 text-white ring-2 ring-green-600 scale-105",
                status === "user" && "bg-green-100 text-green-700 border-2 border-green-500 cursor-default",
              )}
            >
              {num}
              {status === "user" && <span className="block text-xs">✓</span>}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#0078b7]" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gray-300" />
          <span>Occupé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-green-500" />
          <span>Sélectionné</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-green-100 border-2 border-green-500" />
          <span>Votre numéro</span>
        </div>
      </div>
    </div>
  )
}

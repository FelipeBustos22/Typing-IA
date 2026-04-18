"use client"

// ─── Contador animado ─────────────────────────────────────────────────────────
// Interpola un número desde 0 hasta el valor objetivo usando
// requestAnimationFrame. El resultado es un conteo suave tipo "odómetro".
//
// Componente reutilizable: puede usarse en resultados, leaderboard,
// dashboards de estadísticas, etc.

import { useState, useEffect } from "react"
import { MOTOR } from "@/lib/config"

interface IContadorAnimadoProps {
  valor: number
  decimales?: number  // 0 para enteros, 1 para porcentajes
}

export default function ContadorAnimado({ valor, decimales = 0 }: IContadorAnimadoProps) {
  const [mostrado, setMostrado] = useState(0)

  useEffect(() => {
    const duracion = MOTOR.contadorAnimacionMs
    const inicio = performance.now()

    let frame: number
    const animar = (ahora: number) => {
      const progreso = Math.min((ahora - inicio) / duracion, 1)
      // ease-out cúbico: desacelera naturalmente al llegar al valor final
      const curva = 1 - Math.pow(1 - progreso, 3)
      setMostrado(curva * valor)

      if (progreso < 1) {
        frame = requestAnimationFrame(animar)
      }
    }

    frame = requestAnimationFrame(animar)
    return () => cancelAnimationFrame(frame)
  }, [valor])

  return <>{decimales > 0 ? mostrado.toFixed(decimales) : Math.round(mostrado)}</>
}

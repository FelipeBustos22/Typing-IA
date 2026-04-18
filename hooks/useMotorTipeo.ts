// ── Hook useMotorTipeo ────────────────────────────────────────────────────────
//
// Encapsula toda la lógica del motor de tipeo:
// - Máquina de estados (esperando → jugando → terminado)
// - Procesamiento de caracteres y composición (dead keys, IME)
// - Métricas en vivo y resultados finales
// - Detección táctil y manejo de foco
// - Tab para reiniciar
//
// El componente MotorTipeo solo se encarga del render (JSX).
// Este hook se puede testear sin renderizar nada.

import { useState, useRef, useEffect, useCallback } from "react"
import { calcularWpm, calcularPrecision } from "@/lib/calculos"
import { MOTOR, MOVIL } from "@/lib/config"

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type EstadoCaracter = "pendiente" | "correcto" | "error"
export type FaseJuego = "esperando" | "jugando" | "terminado"

export interface IResultadosFinales {
  wpm: number
  precision: number
  tiempo: number
}

interface IUseMotorTipeoArgs {
  textoObjetivo: string
  onIniciar?: () => void
  onReintentar?: () => void
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useMotorTipeo({ textoObjetivo, onIniciar, onReintentar }: IUseMotorTipeoArgs) {

  // ── Estado visual de cada carácter ────────────────────────────────────────
  const [estadosCaracteres, setEstadosCaracteres] = useState<EstadoCaracter[]>(
    () => Array(textoObjetivo.length).fill("pendiente")
  )

  // ── Máquina de estados del juego ──────────────────────────────────────────
  const [faseJuego, setFaseJuego] = useState<FaseJuego>("esperando")

  // ── Resultados calculados al terminar ─────────────────────────────────────
  const [resultadosFinales, setResultadosFinales] = useState<IResultadosFinales | null>(null)

  // ── Métricas en vivo durante el tipeo ─────────────────────────────────────
  const [metricasEnVivo, setMetricasEnVivo] = useState<{ wpm: number; precision: number } | null>(null)

  // ── Refs internos ─────────────────────────────────────────────────────────
  const indicadorActual = useRef<number>(0)
  const tiempoInicio = useRef<number | null>(null)
  const tiempoFin = useRef<number | null>(null)
  const contadorErrores = useRef<number>(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const contenedorRef = useRef<HTMLDivElement>(null)
  const composingRef = useRef(false)

  // Refs para callbacks — mantiene dependencias estables
  const onIniciarRef = useRef(onIniciar)
  useEffect(() => { onIniciarRef.current = onIniciar }, [onIniciar])

  const onReintentarRef = useRef(onReintentar)
  useEffect(() => { onReintentarRef.current = onReintentar }, [onReintentar])

  // ── Procesamiento de caracteres ───────────────────────────────────────────
  const procesarCaracter = useCallback((caracter: string) => {
    const indice = indicadorActual.current
    if (indice >= textoObjetivo.length) return

    // Transición: esperando → jugando
    if (tiempoInicio.current === null) {
      tiempoInicio.current = Date.now()
      setFaseJuego("jugando")
      onIniciarRef.current?.()
    }

    const esperado = textoObjetivo[indice]
    const esCorrecta = caracter === esperado

    if (!esCorrecta) {
      contadorErrores.current += 1
    }

    setEstadosCaracteres(prev => {
      const nuevos = [...prev]
      nuevos[indice] = esCorrecta ? "correcto" : "error"
      return nuevos
    })

    indicadorActual.current = indice + 1

    // Transición: jugando → terminado
    if (indice + 1 >= textoObjetivo.length) {
      tiempoFin.current = Date.now()
      const segundos = (tiempoFin.current - tiempoInicio.current!) / 1000

      setResultadosFinales({
        wpm: calcularWpm(textoObjetivo.length, segundos),
        precision: calcularPrecision(textoObjetivo.length, contadorErrores.current),
        tiempo: Math.round(segundos * 10) / 10
      })
      setFaseJuego("terminado")
    }
  }, [textoObjetivo])

  // ── Handlers de input y composición ───────────────────────────────────────
  const handleInput = useCallback(() => {
    if (composingRef.current) return
    const input = inputRef.current
    if (!input || !input.value) return

    const valor = input.value
    input.value = ""

    for (const c of valor) {
      procesarCaracter(c)
    }
  }, [procesarCaracter])

  const handleCompositionStart = useCallback(() => {
    composingRef.current = true
  }, [])

  const handleCompositionEnd = useCallback(() => {
    composingRef.current = false
    const input = inputRef.current
    if (!input || !input.value) return

    const valor = input.value
    input.value = ""

    for (const c of valor) {
      procesarCaracter(c)
    }
  }, [procesarCaracter])

  // ── Métricas en vivo ──────────────────────────────────────────────────────
  useEffect(() => {
    if (faseJuego !== "jugando") {
      setMetricasEnVivo(null)
      return
    }

    const intervalo = setInterval(() => {
      if (!tiempoInicio.current) return
      const segundos = (Date.now() - tiempoInicio.current) / 1000
      if (segundos <= 0) return

      const caracteresEscritos = indicadorActual.current
      setMetricasEnVivo({
        wpm: calcularWpm(caracteresEscritos, segundos),
        precision: calcularPrecision(caracteresEscritos, contadorErrores.current),
      })
    }, MOTOR.metricasUpdateMs)

    return () => clearInterval(intervalo)
  }, [faseJuego])

  // ── Tab para reiniciar ────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab" && faseJuego === "terminado" && onReintentarRef.current) {
        e.preventDefault()
        onReintentarRef.current()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [faseJuego])

  // ── Detección táctil ──────────────────────────────────────────────────────
  const [esTactil, setEsTactil] = useState(false)

  useEffect(() => {
    const tactil = "ontouchstart" in window
      || window.matchMedia("(pointer: coarse)").matches
    setEsTactil(tactil)
  }, [])

  // ── Foco automático (solo desktop) ────────────────────────────────────────
  useEffect(() => {
    if (!esTactil) {
      inputRef.current?.focus()
    }
  }, [textoObjetivo, esTactil])

  // ── Scroll al área de tipeo cuando el teclado virtual se abre ─────────────
  useEffect(() => {
    if (!esTactil) return

    const vv = window.visualViewport
    if (!vv) return

    const handleResize = () => {
      if (vv.height < window.innerHeight * MOVIL.viewportUmbral) {
        contenedorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    }

    vv.addEventListener("resize", handleResize)
    return () => vv.removeEventListener("resize", handleResize)
  }, [esTactil])

  // ── Handler de tap para móvil ─────────────────────────────────────────────
  const handleTap = useCallback(() => {
    const input = inputRef.current
    if (!input) return
    input.focus()
    input.readOnly = true
    setTimeout(() => {
      input.readOnly = false
      input.focus()
    }, MOVIL.readOnlyDelayMs)
  }, [])

  // ── Hint táctil ───────────────────────────────────────────────────────────
  const [hintVisible, setHintVisible] = useState(true)

  const handleTapConHint = useCallback(() => {
    if (hintVisible) setHintVisible(false)
    handleTap()
  }, [handleTap, hintVisible])

  // ── Posición del cursor (derivada del estado) ─────────────────────────────
  const posicionCursor = estadosCaracteres.findIndex(e => e === "pendiente")

  // ── Retorno ───────────────────────────────────────────────────────────────
  return {
    // Estado
    estadosCaracteres,
    faseJuego,
    resultadosFinales,
    metricasEnVivo,
    posicionCursor,
    esTactil,
    hintVisible,

    // Refs (para el JSX)
    inputRef,
    contenedorRef,

    // Handlers
    handleInput,
    handleCompositionStart,
    handleCompositionEnd,
    handleTapConHint,
  }
}

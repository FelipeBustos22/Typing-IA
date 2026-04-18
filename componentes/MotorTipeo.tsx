"use client"

// ── MotorTipeo ───────────────────────────────────────────────────────────────
// Componente de presentación del motor de tipeo.
// Toda la lógica (máquina de estados, input, métricas) vive en useMotorTipeo.
// Este archivo solo se encarga del render (JSX).

import ContadorAnimado from "@/componentes/ContadorAnimado"
import { useMotorTipeo } from "@/hooks/useMotorTipeo"

// ─── Props ────────────────────────────────────────────────────────────────────

interface IMotorTipeoProps {
  textoObjetivo: string
  onIniciar?: () => void
  onReintentar?: () => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function MotorTipeo({ textoObjetivo, onIniciar, onReintentar }: IMotorTipeoProps) {
  const {
    estadosCaracteres,
    faseJuego,
    resultadosFinales,
    metricasEnVivo,
    posicionCursor,
    esTactil,
    hintVisible,
    inputRef,
    contenedorRef,
    handleInput,
    handleCompositionStart,
    handleCompositionEnd,
    handleTapConHint,
  } = useMotorTipeo({ textoObjetivo, onIniciar, onReintentar })

  return (
    <div
      ref={contenedorRef}
      onClick={handleTapConHint}
      className="outline-none w-full"
    >
      {/* Input que captura la entrada del teclado.
          En desktop es invisible (sr-only). En móvil se posiciona como un
          overlay transparente sobre el área de texto para que el navegador
          lo reconozca como focusable y abra el teclado virtual. */}
      <input
        ref={inputRef}
        onInput={handleInput}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        className="input-captura-movil"
        aria-label="Campo de escritura"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        autoFocus={!esTactil}
        enterKeyHint="done"
      />

      {/* ── Hint táctil: solo visible en dispositivos táctiles ──────────── */}
      {esTactil && faseJuego === "esperando" && (
        <div
          className={`
            flex items-center justify-center gap-2 mb-4
            text-sm text-acento/80 tracking-wide
            transition-all duration-500 ease-out
            ${hintVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-2 pointer-events-none"
            }
          `}
        >
          <svg
            className="w-4 h-4 animar-pulso-suave"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 13V4.5a1.5 1.5 0 0 1 3 0V12" />
            <path d="M11 11.5v-2a1.5 1.5 0 0 1 3 0V12" />
            <path d="M14 10.5a1.5 1.5 0 0 1 3 0V12" />
            <path d="M17 11.5a1.5 1.5 0 0 1 3 0V16a6 6 0 0 1-6 6h-2 .208a6 6 0 0 1-5.012-2.7L7 19c-.312-.479-1.407-2.388-3.286-5.728a1.5 1.5 0 0 1 .536-2.022 1.867 1.867 0 0 1 2.28.28L8 13" />
          </svg>
          <span>toca para abrir el teclado</span>
        </div>
      )}

      {/* ── Área del texto ──────────────────────────────────────────────── */}
      <div
        className="
          relative w-full rounded-sm
          border border-borde bg-bg-elevated
          px-5 py-6 sm:px-8 sm:py-8 min-h-36
          sombra-card
        "
      >
        {/* Línea decorativa izquierda */}
        <div className="absolute left-0 top-6 bottom-6 w-px bg-acento opacity-30 rounded-full" />

        {/* Barra de progreso */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-borde/30 overflow-hidden rounded-b-sm">
          <div
            className="h-full bg-acento/50 transition-all duration-150 ease-out"
            style={{
              width: `${posicionCursor === -1
                ? 100
                : (posicionCursor / textoObjetivo.length) * 100
              }%`,
            }}
          />
        </div>

        {/* Caracteres del texto */}
        <p className="text-base leading-loose wrap-break-word">
          {textoObjetivo.split("").map((caracter, indice) => {
            const estado = estadosCaracteres[indice]
            const esCursor = indice === posicionCursor

            return (
              <span
                key={indice}
                className={[
                  "transition-colors duration-100",
                  estado === "correcto" && "text-brillante",
                  estado === "error"    && "text-error bg-error/10 rounded-xs",
                  estado === "pendiente" && !esCursor && "text-opaco",
                  esCursor && "text-brillante underline decoration-acento decoration-2 underline-offset-4 cursor-parpadeo",
                ].filter(Boolean).join(" ")}
              >
                {caracter === " " ? " " : caracter}
              </span>
            )
          })}
        </p>
      </div>

      {/* ── Leyenda inferior ──────────────────────────────────────────────── */}
      <div className="mt-5 flex items-center justify-center gap-6 text-sm text-opaco tracking-wide">
        <span className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-brillante opacity-60" />
          correcto
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-error opacity-60" />
          error
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-acento opacity-60" />
          cursor
        </span>
      </div>

      {/* ── Indicadores de fase ────────────────────────────────────────────── */}
      {faseJuego === "esperando" && (
        <p className="mt-3 text-sm text-muted animate-pulse text-center">
          empieza a escribir para iniciar el cronómetro
        </p>
      )}

      {faseJuego === "jugando" && metricasEnVivo && (
        <div className="mt-3 flex items-center justify-center gap-6 text-sm animar-aparicion">
          <span className="text-acento/70 tabular-nums">
            {metricasEnVivo.wpm} <span className="text-xs text-opaco">wpm</span>
          </span>
          <span className="text-brillante/70 tabular-nums">
            {metricasEnVivo.precision}% <span className="text-xs text-opaco">precisión</span>
          </span>
        </div>
      )}

      {/* ── Resultados finales ─────────────────────────────────────────────── */}
      {faseJuego === "terminado" && resultadosFinales && (
        <div className="mt-4 w-full rounded-sm border border-borde bg-bg-elevated px-4 sm:px-6 py-5 animar-aparicion sombra-card">
          <p className="text-xs text-muted tracking-widest uppercase mb-3">resultados</p>
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl sm:text-2xl font-semibold text-acento tabular-nums">
                <ContadorAnimado valor={resultadosFinales.wpm} />
              </span>
              <span className="text-xs text-opaco">wpm</span>
            </div>
            <div className="w-px h-8 bg-borde" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl sm:text-2xl font-semibold text-brillante tabular-nums">
                <ContadorAnimado valor={resultadosFinales.precision} decimales={1} />%
              </span>
              <span className="text-xs text-opaco">precisión</span>
            </div>
            <div className="w-px h-8 bg-borde" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl sm:text-2xl font-semibold text-texto tabular-nums">
                <ContadorAnimado valor={resultadosFinales.tiempo} decimales={1} />s
              </span>
              <span className="text-xs text-opaco">tiempo</span>
            </div>
          </div>

          {onReintentar && (
            <div className="mt-5 flex flex-col items-center gap-2">
              <button
                onClick={onReintentar}
                className="
                  px-5 py-2 text-sm rounded-sm
                  border border-acento/50 text-acento
                  hover:border-acento hover:bg-acento/5
                  transition-all duration-150
                "
              >
                nuevo texto
              </button>
              {!esTactil && (
                <span className="text-[11px] text-opaco/60 tracking-wide animar-aparicion-lenta">
                  o presiona <kbd className="px-1.5 py-0.5 rounded-xs border border-borde text-opaco text-[10px]">tab</kbd> para reiniciar
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

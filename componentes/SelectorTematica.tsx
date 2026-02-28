"use client"

// ¿Por qué "use client" aquí?
// Este componente usa onClick, onChange y useState — todos son capacidades del
// navegador. Sin "use client", Next.js intentaría ejecutarlo en el servidor,
// donde no existen eventos ni estado interactivo, y lanzaría un error.

import { useState } from "react"
import type { ITextoGenerado } from "@/types"
import MotorTipeo from "@/componentes/MotorTipeo"

// ─── Props ────────────────────────────────────────────────────────────────────
interface ISelectorTematicaProps {
  tematicas: string[]
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function SelectorTematica({ tematicas }: ISelectorTematicaProps) {

  // ── Estado del componente ──────────────────────────────────────────────────
  // useState guarda valores que, cuando cambian, hacen que React redibuje
  // el componente automáticamente con los nuevos valores.
  //
  // Cada useState devuelve un par: [valorActual, funcionParaCambiarlo]
  // El argumento de useState es el valor inicial.

  // Qué temática está seleccionada (null = ninguna todavía)
  const [tematicaActiva, setTematicaActiva] = useState<string | null>(null)

  // El texto generado por Ollama. ITextoGenerado | null tipea que puede
  // tener datos o estar vacío (antes de la primera petición).
  const [resultado, setResultado] = useState<ITextoGenerado | null>(null)

  // true mientras esperamos respuesta de Ollama. Sirve para deshabilitar
  // botones y mostrar el indicador de carga.
  const [cargando, setCargando] = useState<boolean>(false)

  // Mensaje de error si algo falla. null = sin error.
  const [error, setError] = useState<string | null>(null)

  // true mientras el usuario está escribiendo activamente (fase "jugando").
  // Bloqueamos los botones de temática durante la partida para no interrumpir
  // al usuario en medio de un texto. Se resetea cuando se pide un nuevo texto.
  const [estaJugando, setEstaJugando] = useState<boolean>(false)

  // ── Lógica principal ───────────────────────────────────────────────────────
  // Esta función se ejecuta cada vez que el usuario hace clic en una temática.
  // Es async porque necesita esperar la respuesta del servidor (fetch a nuestra API).

  async function handleSeleccionarTematica(tematica: string) {
    // Si ya está cargando, ignoramos el click extra.
    if (cargando) return

    // Reseteamos estaJugando al pedir un nuevo texto, independientemente
    // de si veníamos de una partida terminada o de ningún lado.
    setEstaJugando(false)

    // Actualizamos el estado visual inmediatamente (el botón se marca como activo)
    // antes de esperar la respuesta de Ollama. Así la UI responde al instante.
    setTematicaActiva(tematica)
    setCargando(true)
    setError(null)       // limpiamos cualquier error previo
    setResultado(null)   // limpiamos el texto anterior mientras llega el nuevo

    try {
      // Llamamos a NUESTRA API en Next.js, no a Ollama directamente.
      // route.ts en el servidor recibirá esto y se encargará de hablar con Ollama.
      const respuesta = await fetch("/api/texto-generado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tematica }),
      })

      // Si el servidor respondió con error (4xx, 5xx), lo manejamos.
      // fetch no lanza excepción por errores HTTP, hay que revisarlo manualmente.
      if (!respuesta.ok) {
        const datos = await respuesta.json()
        throw new Error(datos.error ?? `Error ${respuesta.status}`)
      }

      // Parseamos el JSON de respuesta y lo guardamos en el estado.
      // Esto dispara un re-render: React redibuja el componente con el texto nuevo.
      const datos: ITextoGenerado = await respuesta.json()
      setResultado(datos)

    } catch (err) {
      // Cualquier fallo (red caída, Ollama apagado, etc.) llega aquí.
      const mensaje = err instanceof Error ? err.message : "Error desconocido"
      setError(mensaje)
    } finally {
      // finally se ejecuta SIEMPRE: tanto si el try tuvo éxito como si falló.
      // Es el lugar correcto para apagar el indicador de carga.
      setCargando(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  // Todo lo que está debajo es JSX: la descripción visual del componente.
  // React lo ejecuta cada vez que cambia cualquier estado de arriba.

  return (
    <div className="flex flex-col items-center gap-10 w-full">

      {/* ── Botones de temática ─────────────────────────────────────────── */}
      <section className="flex flex-col items-center gap-4 w-full">
        <p className="text-xs text-muted tracking-widest uppercase animar-entrada retraso-1">
          elige una temática
        </p>
        <div className="flex flex-wrap justify-center gap-2 animar-entrada retraso-2">
          {tematicas.map((tematica) => {
            // Calculamos las clases CSS según el estado del botón.
            // Un botón puede estar: inactivo, activo (seleccionado) o deshabilitado (cargando).
            const estaActivo = tematica === tematicaActiva
            // Deshabilitamos durante la carga Y durante la partida activa.
            // "estaJugando" lo pone MotorTipeo a true con la primera tecla.
            const estaDeshabilitado = cargando || estaJugando

            return (
              <button
                key={tematica}
                onClick={() => handleSeleccionarTematica(tematica)}
                disabled={estaDeshabilitado}
                className={`
                  px-4 py-1.5 rounded-sm text-sm
                  border transition-all duration-150
                  disabled:cursor-not-allowed disabled:opacity-40
                  ${estaActivo
                    ? "border-acento text-acento bg-acento-dim"
                    : "border-borde text-muted hover:border-borde-bright hover:text-texto"
                  }
                `}
              >
                {tematica}
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Área de estado (carga / error / inicial) ──────────────────────
          Solo se renderiza cuando NO hay resultado.
          Cuando el resultado llega, esta sección desaparece completamente
          y MotorTipeo ocupa el espacio visual. */}
      {!resultado && (
        <section className="w-full">
          <div
            className="
              relative w-full rounded-sm
              border border-borde bg-bg-elevated
              px-5 py-6 sm:px-8 sm:py-8 min-h-36
              flex items-center sombra-card
            "
          >
            {/* Línea decorativa izquierda: cambia de color según el estado */}
            <div className={`
              absolute left-0 top-6 bottom-6 w-px rounded-full transition-colors duration-300
              ${error ? "bg-error opacity-70" : "bg-acento opacity-30"}
            `} />

            {/* ── Estado: cargando ────────────────────────────────────── */}
            {cargando && (
              <div className="flex flex-col gap-3 w-full animar-aparicion">
                <div className="h-5 rounded-sm bg-borde-bright animar-pulso w-full" />
                <div className="h-5 rounded-sm bg-borde-bright animar-pulso w-4/5" style={{ animationDelay: "0.15s" }} />
                <div className="h-5 rounded-sm bg-borde-bright animar-pulso w-3/5" style={{ animationDelay: "0.3s" }} />
                <p className="text-xs text-muted mt-1 tracking-wide">
                  generando texto sobre <span className="text-acento">{tematicaActiva}</span>...
                </p>
              </div>
            )}

            {/* ── Estado: error ───────────────────────────────────────── */}
            {!cargando && error && (
              <div className="flex flex-col gap-2 animar-aparicion">
                <p className="text-sm text-error">
                  no se pudo conectar con el modelo de IA
                </p>
                <p className="text-xs text-muted">
                  {error}
                </p>
              </div>
            )}

            {/* ── Estado: inicial (sin selección) ────────────────────── */}
            {!cargando && !error && (
              <p className="text-base sm:text-lg leading-relaxed text-opaco select-none animar-entrada retraso-3">
                selecciona una temática para generar
                <span className="text-muted"> el texto</span>
                <span className="text-acento cursor-parpadeo"> _</span>
              </p>
            )}
          </div>
        </section>
      )}
      {/* ── Motor de tipado ──────────────────────────────────────────────────
          Cuando Ollama devuelve el texto, montamos MotorTipeo pasándole el
          texto como prop.

          La prop key={resultado.texto} es un truco de React: cuando el valor
          de key cambia, React DESTRUYE el componente viejo y crea uno nuevo.
          Esto garantiza que cada vez que llega un texto diferente, el motor
          arranca con estado limpio (índice en 0, todos los caracteres pendientes).
          Sin esta key, el motor recordaría el avance del texto anterior.
      ────────────────────────────────────────────────────────────────────── */}
      {!cargando && !error && resultado && (
        <section className="w-full animar-aparicion">
          <MotorTipeo
            key={resultado.texto}
            textoObjetivo={resultado.texto}
            onIniciar={() => setEstaJugando(true)}
            onReintentar={() => handleSeleccionarTematica(tematicaActiva!)}
          />
        </section>
      )}

    </div>
  )
}

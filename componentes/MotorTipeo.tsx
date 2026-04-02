"use client"

// ¿Por qué "use client"?
// Este componente captura eventos de teclado (onKeyDown), usa useEffect para
// registrar listeners del navegador, y usa useState/useRef para manejar estado.
// Todo eso son capacidades del navegador, no del servidor.

import { useState, useRef, useEffect, useCallback } from "react"
import { calcularWpm, calcularPrecision } from "@/lib/calculos"

// ─── Tipos locales ─────────────────────────────────────────────────────────────
// Cada carácter del texto puede estar en uno de estos tres estados visuales.
// Este tipo no va en types/index.ts porque solo lo usa este componente.

type EstadoCaracter = "pendiente" | "correcto" | "error"

// ── Fase del juego (máquina de estados) ────────────────────────────────────────
// En lugar de usar múltiples booleanos (estaJugando, haTerminado), un único string
// con tres valores hace el código más predecible. El componente solo puede estar
// en UNA de estas fases a la vez — nunca "jugando" y "terminado" simultáneamente.
//
// Flujo:  esperando ──(primera tecla)──▶ jugando ──(último carácter)──▶ terminado

type FaseJuego = "esperando" | "jugando" | "terminado"

// ── Resultados finales ───────────────────────────────────────────────────────
// Guardamos los resultados calculados cuando el juego termina.
// Esta interfaz es local porque solo la usa este componente.
interface IResultadosFinales {
  wpm: number        // palabras por minuto
  precision: number  // porcentaje de acierto
  tiempo: number     // segundos totales
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface IMotorTipeoProps {
  textoObjetivo: string       // el texto que el usuario debe mecanografiar
  onIniciar?: () => void      // se llama cuando el usuario escribe la primera letra
  onReintentar?: () => void   // se llama cuando el usuario pulsa "nuevo texto"
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function MotorTipeo({ textoObjetivo, onIniciar, onReintentar }: IMotorTipeoProps) {

  // ── useState: estados visuales de cada carácter ────────────────────────────
  // Este array tiene una entrada por cada carácter del texto.
  // Ejemplo para "hola": ["pendiente", "pendiente", "pendiente", "pendiente"]
  //
  // Está en useState porque cuando cambia (el usuario escribe una letra),
  // React necesita redibujar el componente para mostrar el nuevo color.
  //
  // La función dentro de useState(() => ...) se llama "inicializador lazy":
  // se ejecuta solo una vez al montar el componente, no en cada re-render.
  // Es más eficiente que Array(n).fill(...) fuera del useState.
  const [estadosCaracteres, setEstadosCaracteres] = useState<EstadoCaracter[]>(
    () => Array(textoObjetivo.length).fill("pendiente")
  )

  // ── useState: fase actual del juego ────────────────────────────────────────
  // Este es el estado de la "máquina de estados" del juego.
  // Empieza en "esperando" (el texto está visible pero el usuario aún no escribe).
  //
  // ¿Por qué useState y no useRef?
  // Porque el cambio de fase SÍ debe redibujar la UI:
  // - "esperando" → muestra un indicador de "empieza a escribir"
  // - "jugando"   → muestra las métricas en tiempo real
  // - "terminado" → muestra los resultados finales
  const [faseJuego, setFaseJuego] = useState<FaseJuego>("esperando")

  // ── useState: resultados finales ──────────────────────────────────────────
  // Cuando el juego termina, calculamos WPM, precisión y tiempo dentro del
  // event handler (donde sí podemos leer refs) y guardamos los resultados
  // en este estado. El render lee de aquí, nunca directamente de los refs.
  //
  // ¿Por qué no leer los refs en el render?
  // React prohíbe leer ref.current durante el render (el JSX) porque los refs
  // son "opacos" para el sistema de reactividad: React no sabe cuándo cambian
  // y no puede garantizar que el componente se redibuje correctamente.
  // La solución es calcular los valores en el handler y guardarlos en estado.
  const [resultadosFinales, setResultadosFinales] = useState<IResultadosFinales | null>(null)

  // ── useRef: posición actual del cursor ────────────────────────────────────
  // Guardamos el índice del carácter que el usuario debe escribir a continuación.
  //
  // ¿Por qué useRef y no useState?
  // Porque este valor solo lo necesitamos para la lógica dentro del event handler,
  // no directamente en el render. El render calcula la posición del cursor
  // derivándola del array de estados (primera posición "pendiente").
  // Separar ambas responsabilidades evita el error de React que prohíbe
  // leer ref.current durante el render.
  const indicadorActual = useRef<number>(0)

  // ── useRef: timestamps del cronómetro ─────────────────────────────────────
  // Guardamos el instante en que el usuario empieza a escribir y en que termina.
  //
  // ¿Por qué useRef y no useState?
  // Porque guardar un timestamp no necesita redibujar nada inmediatamente.
  // Solo necesitamos estos valores para hacer cálculos (WPM, tiempo total)
  // en momentos puntuales (cada tecla o al terminar).
  //
  // El tipo es `number | null` porque al inicio no tenemos valor todavía.
  // null significa "el cronómetro aún no ha arrancado / no ha parado".
  const tiempoInicio = useRef<number | null>(null)
  const tiempoFin = useRef<number | null>(null)

  // ── useRef: callbacks de fase ──────────────────────────────────────────────
  // Las funciones onIniciar y onReintentar vienen de SelectorTematica como props.
  // Si las ponemos directamente en el array de dependencias del useCallback,
  // el handler se recrearía en cada render de SelectorTematica (porque las
  // funciones inline se recrean en cada render del padre).
  //
  // Guardamos los callbacks en refs y mantenemos el array de dependencias limpio.
  // El patrón es: el ref siempre apunta a la última versión de la función,
  // pero su identidad (la referencia al objeto ref en sí) nunca cambia.
  const onIniciarRef = useRef(onIniciar)
  useEffect(() => { onIniciarRef.current = onIniciar }, [onIniciar])

  // ── useCallback: handler del teclado ──────────────────────────────────────
  // useCallback memoriza esta función entre renders.
  //
  // ¿Por qué es necesario memorizar la función?
  // Porque la usamos como dependencia en el useEffect de abajo. Si la función
  // se recreara en cada render, el useEffect detectaría un "cambio" en cada
  // render y re-registraría el listener constantemente.
  // Con useCallback, la función solo se recrea cuando cambia textoObjetivo
  // (ej: el usuario seleccionó una nueva temática).
  // ── useRef: contador de errores ────────────────────────────────────────────
  // Contamos las pulsaciones incorrectas para calcular la precisión al final.
  //
  // Va en useRef porque es un contador interno que solo se lee al hacer cálculos,
  // no necesita provocar un re-render cada vez que el usuario se equivoca.
  const contadorErrores = useRef<number>(0)

  // ── Ref para el input oculto que captura la entrada del teclado ────────────
  // Usamos un <input> oculto en lugar de window.addEventListener("keydown")
  // porque el evento "input" siempre entrega el carácter compuesto final
  // (ej: dead key + a = "á"), mientras que "keydown" en Linux puede entregar
  // solo el carácter base sin el acento.
  const inputRef = useRef<HTMLInputElement>(null)
  const composingRef = useRef(false)

  // ── Lógica central: procesar un carácter ingresado ────────────────────────
  const procesarCaracter = useCallback((caracter: string) => {
    const indice = indicadorActual.current

    if (indice >= textoObjetivo.length) return

    // ── Transición: esperando → jugando ─────────────────────────────────────
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

    // ── Transición: jugando → terminado ──────────────────────────────────────
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

  // ── Handler del evento "input" en el input oculto ─────────────────────────
  // El evento "input" se dispara después de que el navegador compone el
  // carácter final (dead keys, IME, etc.), garantizando que recibimos "á"
  // en lugar de "Dead" + "a" por separado.
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

  // ── Composition events: para IME y dead keys en ciertos entornos ──────────
  // En algunos sistemas Linux, las dead keys disparan compositionStart/End.
  // Ignoramos los eventos "input" intermedios durante la composición y
  // procesamos el resultado final en compositionEnd.
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

  // ── Mantener el foco en el input oculto ───────────────────────────────────
  useEffect(() => {
    inputRef.current?.focus()
  }, [textoObjetivo])

  // ── Render ─────────────────────────────────────────────────────────────────

  // Derivamos la posición del cursor desde el array de estados:
  // el cursor está en el primer carácter que todavía está "pendiente".
  // findIndex devuelve -1 si no encuentra ninguno (texto completado).
  //
  // ¿Por qué no usar indicadorActual.current aquí?
  // React prohíbe leer refs durante el render porque son valores "opacos" para
  // el sistema de reactividad: React no sabe cuándo cambian y no puede garantizar
  // que el componente se redibuje correctamente si los lees en el JSX.
  // Al derivar la posición desde el estado, el render siempre es predecible.
  const posicionCursor = estadosCaracteres.findIndex(e => e === "pendiente")

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="outline-none w-full"
    >
      {/* Input oculto que captura la entrada del teclado.
          Usamos un input real en lugar de keydown en window porque el evento
          "input" siempre entrega el carácter compuesto final (dead keys, IME). */}
      <input
        ref={inputRef}
        onInput={handleInput}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        className="sr-only"
        aria-label="Campo de escritura"
        autoFocus
      />
      {/* ── Área del texto ──────────────────────────────────────────────── */}
      <div
        className="
          relative w-full rounded-sm
          border border-borde bg-bg-elevated
          px-5 py-6 sm:px-8 sm:py-8 min-h-36
          sombra-card
        "
      >
        {/* Línea decorativa izquierda — brilla suavemente con el acento ámbar */}
        <div className="absolute left-0 top-6 bottom-6 w-px bg-acento opacity-30 rounded-full" />

        {/* ── Caracteres del texto ─────────────────────────────────────── */}
        {/* Cada carácter vive en su propio <span> para colorearlo según estado.

            break-words (overflow-wrap: break-word) respeta los límites de
            las palabras: solo divide una palabra si no cabe entera en la línea.
            Esto evita cortes como "bu-enas" en medio de una palabra.

            Usamos el espacio normal " " en vez de \u00A0 (non-breaking space)
            porque \u00A0 no actúa como punto de salto de línea — CSS lo trata
            como parte de la misma "palabra", impidiendo que el texto envuelva
            correctamente. Con espacios normales y break-words, el texto se
            parte solo entre palabras, igual que en cualquier párrafo. */}
        <p
          className="text-base leading-loose wrap-break-word"
        >
          {textoObjetivo.split("").map((caracter, indice) => {
            const estado = estadosCaracteres[indice]
            const esCursor = indice === posicionCursor

            return (
              <span
                key={indice}
                className={[
                  // Transición suave al cambiar de color pendiente → correcto/error
                  "transition-colors duration-100",
                  // Color según el estado del carácter
                  estado === "correcto" && "text-brillante",
                  estado === "error"    && "text-error bg-error/10 rounded-xs",
                  estado === "pendiente" && !esCursor && "text-opaco",
                  // Cursor: texto brillante, subrayado ámbar parpadeante
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

      {/* ── Indicador de estado del juego ──────────────────────────────────── */}
      {/* Mostramos un mensaje contextual según la fase:
          - "esperando": invita al usuario a empezar
          - "jugando": (reservado para métricas en tarea 2.6)
          - "terminado": muestra el resumen usando las funciones de cálculo */}
      {faseJuego === "esperando" && (
        <p className="mt-3 text-sm text-muted animate-pulse text-center">
          empieza a escribir para iniciar el cronómetro
        </p>
      )}

      {/* ── Resultados finales ───────────────────────────────────────────────
          Leemos de resultadosFinales (useState), NO de los refs.
          React puede renderizar esto de forma segura y predecible. */}
      {faseJuego === "terminado" && resultadosFinales && (
        <div className="mt-4 w-full rounded-sm border border-borde bg-bg-elevated px-4 sm:px-6 py-5 animar-aparicion sombra-card">
          <p className="text-xs text-muted tracking-widest uppercase mb-3">resultados</p>
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl sm:text-2xl font-semibold text-acento">
                {resultadosFinales.wpm}
              </span>
              <span className="text-xs text-opaco">wpm</span>
            </div>
            <div className="w-px h-8 bg-borde" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl sm:text-2xl font-semibold text-brillante">
                {resultadosFinales.precision}%
              </span>
              <span className="text-xs text-opaco">precisión</span>
            </div>
            <div className="w-px h-8 bg-borde" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl sm:text-2xl font-semibold text-texto">
                {resultadosFinales.tiempo}s
              </span>
              <span className="text-xs text-opaco">tiempo</span>
            </div>
          </div>

          {/* Botón de reinicio. Al pulsarlo llama a onReintentar, que vive en
              SelectorTematica y dispara una nueva petición a Ollama con la
              misma temática, generando un texto diferente. */}
          {onReintentar && (
            <div className="mt-5 flex justify-center">
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
            </div>
          )}
        </div>
      )}
    </div>
  )
}

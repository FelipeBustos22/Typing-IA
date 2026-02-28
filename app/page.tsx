// page.tsx es un Server Component (sin "use client").
// Su responsabilidad es SOLO estructura y composición: qué aparece en la página
// y en qué orden. No contiene lógica de interacción ni llamadas a APIs.
// Toda la interactividad vendrá de componentes hijos con "use client".

// Las temáticas disponibles están definidas aquí porque son datos estáticos.
// Cuando en Fase 2 se vuelvan dinámicas (leídas de una DB o config), se moverán.
const TEMATICAS = [
  "programación",
  "historia",
  "ciencia",
  "filosofía",
  "literatura",
]

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-4xl mx-auto w-full gap-12">

      {/* ── Selector de temática ─────────────────────────────────────────
          Por ahora son botones estáticos sin onClick.
          En Tarea 1.6 este bloque será reemplazado por <SelectorTematica />,
          un Client Component que manejará la lógica de selección y el fetch.
          ────────────────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center gap-4 w-full">
        <p className="text-xs text-muted tracking-widest uppercase">
          elige una temática
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {TEMATICAS.map((tematica) => (
            <button
              key={tematica}
              // Estilos base del botón: borde sutil, texto apagado
              // El primer botón tendrá el estilo "activo" como referencia visual.
              // En Fase 1 esto es puramente decorativo.
              className="
                px-4 py-1.5 rounded-sm text-sm
                border border-borde text-muted
                hover:border-borde-bright hover:text-texto
                transition-colors duration-150
                first:border-acento first:text-acento first:bg-acento-dim
              "
            >
              {tematica}
            </button>
          ))}
        </div>
      </section>

      {/* ── Área de texto del juego ──────────────────────────────────────
          Este es el corazón visual de la app: donde aparecerá el texto
          generado por Ollama y donde el usuario escribirá por encima.

          En Tarea 1.6 este bloque será el componente <MotorTipeo /> de Fase 2.
          Por ahora muestra un placeholder estático que define la forma del área.
          ────────────────────────────────────────────────────────────────── */}
      <section className="w-full">
        <div
          className="
            relative w-full rounded-sm
            border border-borde
            bg-bg-elevated
            px-8 py-8
            min-h-36
            flex items-center
          "
        >
          {/* Línea decorativa de acento en el borde izquierdo */}
          <div className="absolute left-0 top-6 bottom-6 w-px bg-acento opacity-40 rounded-full" />

          {/* Texto placeholder: su apariencia anticipa cómo se verá el texto real */}
          <p className="text-2xl leading-relaxed tracking-wide text-opaco select-none">
            selecciona una temática para generar
            <span className="text-texto"> el texto</span>
            <span className="text-acento cursor-parpadeo"> _</span>
          </p>
        </div>

        {/* Instrucción de ayuda bajo el área de texto */}
        <p className="mt-3 text-xs text-opaco text-center tracking-wide">
          escribe sobre el texto generado · las letras correctas aparecen en blanco · las incorrectas en rojo
        </p>
      </section>

    </div>
  )
}


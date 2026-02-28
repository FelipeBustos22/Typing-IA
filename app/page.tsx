// page.tsx es un Server Component (sin "use client").
// Su responsabilidad es SOLO estructura y composición: qué aparece en la página
// y en qué orden. No contiene lógica de interacción ni llamadas a APIs.
// Toda la interactividad ocurre dentro de SelectorTematica (Client Component).

import SelectorTematica from "@/componentes/SelectorTematica"

// Las temáticas son datos estáticos: viven aquí en el Server Component.
// Cuando en el futuro se lean de una base de datos, esta será la única línea que cambie.
// El componente hijo no sabe ni le importa de dónde vienen: solo las muestra.
const TEMATICAS = [
  "programación",
  "historia",
  "ciencia",
  "filosofía",
  "literatura",
]

export default function Home() {
  return (
    // ── Posicionamiento vertical ──────────────────────────────────────────
    // Antes: justify-center centraba todo al 50% de la pantalla, creando
    // un bloque vacío enorme entre el navbar y el contenido.
    //
    // Ahora: pt-[8vh] / pt-[12vh] posiciona el contenido en el "tercio
    // superior" de la pantalla (golden ratio ~38% desde arriba).
    // Esto es lo que hacen Monkeytype y todas las apps de mecanografía:
    // el texto queda a la altura natural de descanso del ojo, no en el
    // centro geométrico que se siente artificialmente bajo.
    //
    // pb-10 asegura espacio inferior para cuando aparece el panel de resultados.
    <div className="flex-1 flex flex-col items-center pt-[8vh] sm:pt-[12vh] pb-10 sm:pb-16 px-4 sm:px-6 max-w-4xl mx-auto w-full">

      {/* ── Hero contextual ────────────────────────────────────────────────
          Funciona como el MOTD (Message Of The Day) de una terminal Linux:
          una línea informativa que aparece al abrir la sesión y comunica
          de qué va esto, sin ser intrusiva ni competir con la zona de tipeo.

          ¿Por qué un <h1>?
          Aunque es visualmente sutil, el <h1> es semánticamente correcto:
          es el encabezado principal de la página. Los motores de búsqueda
          y los lectores de pantalla lo reconocen como el título, mejorando
          tanto SEO como accesibilidad. El estilo visual no tiene por qué
          coincidir con la jerarquía semántica — pueden ir separados.

          ¿Por qué está en page.tsx y no en SelectorTematica?
          Porque es contenido estático y estructural: no cambia según el
          estado del juego. Eso es responsabilidad de un Server Component.
          Al estar aquí se renderiza en el servidor y llega como HTML puro
          al navegador — 0 JavaScript necesario para mostrarlo. */}
      <div className="mb-10 sm:mb-14 text-center animar-entrada select-none">
        <h1 className="text-base sm:text-lg text-texto tracking-tight font-normal">
          mecanografía
          {/* El símbolo × (multiplicación) actúa como operador visual de
              "fusión" o "cruce" — encaja con la estética code/matemática
              del proyecto. Más interesante que un guion o una barra. */}
          <span className="text-opaco/50 mx-2 font-light">×</span>
          <span className="text-acento font-medium">IA</span>
        </h1>
        {/* Subtítulo: uppercase + tracking-widest + tamaño diminuto (11px)
            imita las etiquetas de clasificación de terminales militares o
            las cabeceras de documentos técnicos. Es información útil para
            quien llega por primera vez, pero tan discreta que desaparece
            perceptualmente cuando estás enfocado en escribir. */}
        <p className="text-[11px] text-acento/50 mt-2.5 tracking-widest uppercase max-w-xs mx-auto leading-relaxed">
          textos generados en tiempo real por inteligencia artificial
        </p>
        {/* Línea decorativa: cierra el bloque hero y crea una frontera
            visual sutil entre la "zona de identidad" (hero) y la
            "zona interactiva" (selector de temática + motor de tipeo). */}
        <div className="w-10 h-px bg-borde-bright/50 mx-auto mt-5" />
      </div>

      {/*
        SelectorTematica es un Client Component: maneja clicks, fetch a Ollama,
        estado de carga y el texto generado. Le pasamos las temáticas como prop.
        Este Server Component no sabe qué pasa dentro de él: simplemente lo monta.
      */}
      <SelectorTematica tematicas={TEMATICAS} />
    </div>
  )
}

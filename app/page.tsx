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
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-4xl mx-auto w-full">
      {/*
        SelectorTematica es un Client Component: maneja clicks, fetch a Ollama,
        estado de carga y el texto generado. Le pasamos las temáticas como prop.
        Este Server Component no sabe qué pasa dentro de él: simplemente lo monta.
      */}
      <SelectorTematica tematicas={TEMATICAS} />
    </div>
  )
}

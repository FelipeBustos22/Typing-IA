"use client"

// ── Error Boundary Global ────────────────────────────────────────────────────
// Next.js ejecuta este componente cuando un error no capturado ocurre en
// cualquier Client Component hijo de layout.tsx. Sin esto, la página entera
// muere con una pantalla en blanco.
//
// "use client" es obligatorio: los error boundaries de Next.js SOLO funcionan
// como Client Components porque necesitan el método componentDidCatch de React
// (que solo existe en el navegador).

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 animar-aparicion">
      <div className="max-w-md w-full text-center">

        {/* Indicador visual de error — coherente con la estética CRT */}
        <div className="mb-6">
          <span className="text-4xl font-semibold text-error">!</span>
        </div>

        <h2 className="text-lg text-brillante font-medium mb-2">
          algo salió mal
        </h2>

        <p className="text-sm text-muted mb-1">
          ocurrió un error inesperado en la aplicación.
        </p>

        {/* Mensaje técnico: útil para debugging, sutil para no asustar */}
        <p className="text-xs text-opaco/60 mb-6 break-words">
          {error.message}
        </p>

        <button
          onClick={reset}
          className="
            px-5 py-2 text-sm rounded-sm
            border border-acento/50 text-acento
            hover:border-acento hover:bg-acento/5
            transition-all duration-150
          "
        >
          reintentar
        </button>
      </div>
    </div>
  )
}

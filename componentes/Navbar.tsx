export default function Navbar() {
  return (
    <header className="w-full border-b border-borde">
      <nav className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* ── Logo ────────────────────────────────────────────────────── */}
        {/* El cursor parpadeante después del nombre es un guiño al contexto
            de la app: estás a punto de escribir. */}
        <div className="flex items-center gap-0 select-none">
          <span className="text-lg font-medium text-brillante tracking-tight">
            typing
          </span>
          {/* El acento ámbar sobre "AI" diferencia la palabra clave del resto */}
          <span className="text-sm font-medium text-acento tracking-tight">
            AI
          </span>
          <span
            className="text-sm font-medium text-acento ml-0.5 cursor-parpadeo"
            aria-hidden="true"   /* decorativo: los lectores de pantalla lo ignoran */
          >
            _
          </span>
        </div>

        {/* ── Indicadores de estado (vacíos por ahora, se llenan en Fase 2) ─ */}
        {/* En Fase 2 estos mostrarán WPM y precisión en tiempo real.
            Por ahora están como placeholders visuales. */}
        <div className="flex items-center gap-5 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="text-opaco">wpm</span>
            <span className="text-texto">—</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-opaco">acc</span>
            <span className="text-texto">—</span>
          </span>
        </div>

      </nav>
    </header>
  )
}

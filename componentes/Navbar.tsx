export default function Navbar() {
  return (
    <header className="w-full border-b border-borde animar-entrada-arriba">
      <nav className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

        {/* ── Logo ────────────────────────────────────────────────────── */}
        {/* El cursor parpadeante después del nombre es un guiño al contexto
            de la app: estás a punto de escribir. */}
        <div className="flex items-center gap-0 select-none">
          <span className="text-xl font-medium text-brillante tracking-tight">
            typing
          </span>
          {/* El acento ámbar sobre "AI" diferencia la palabra clave del resto */}
          <span className="text-md font-medium text-acento tracking-tight">
            AI
          </span>
          <span
            className="text-sm font-medium text-acento ml-0.5 cursor-parpadeo"
            aria-hidden="true"   /* decorativo: los lectores de pantalla lo ignoran */
          >
            _
          </span>
        </div>

      </nav>
    </header>
  )
}

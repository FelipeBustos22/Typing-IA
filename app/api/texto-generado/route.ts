import { NextResponse } from "next/server"
import { z } from "zod"
import { generarTexto } from "@/lib/ollama"
import { verificarRateLimit } from "@/lib/rate-limit"

// ─── Schema de validación ─────────────────────────────────────────────────────
// Zod valida el body de forma declarativa. Agregar campos futuros (dificultad,
// idioma) solo requiere extender este schema.
const BodySchema = z.object({
  tematica: z
    .string({ message: "El campo 'tematica' es obligatorio." })
    .min(1, { message: "El campo 'tematica' no puede estar vacío." })
    .max(100, { message: "La temática no puede exceder 100 caracteres." })
    .transform(s => s.trim()),
})

// ─── Handler POST ──────────────────────────────────────────────────────────────
// Next.js ejecuta esta función cuando llega una petición POST a /api/texto-generado.
// El nombre "POST" no es arbitrario: debe coincidir exactamente con el método HTTP
export async function POST(request: Request) {

  // ── 0. Rate Limiting ───────────────────────────────────────────────────────
  // Solo aplicamos rate limit en producción.
  //
  // En desarrollo (npm run dev), NODE_ENV es "development" y saltamos este bloque.
  // Razones:
  // - En local se usa Ollama, que no tiene cuota que proteger.
  // - En local no hay proxy, así que todas las peticiones comparten el mismo
  //   bucket "anonimo" — lo que generaría 429s molestos al probar rápido.
  // - Next.js setea NODE_ENV automáticamente: "development" con `npm run dev`,
  //   "production" con `npm run build && npm start` o en Vercel.
  if (process.env.NODE_ENV === "production") {
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded?.split(",").at(0)?.trim()
      ?? request.headers.get("x-real-ip")
      ?? "anonimo"

    const rateLimit = verificarRateLimit(ip)

    if (!rateLimit.permitido) {
      const mensaje = rateLimit.motivo === "dia"
        ? "Has alcanzado el límite diario. Vuelve mañana."
        : "Demasiadas peticiones. Espera un momento antes de intentar de nuevo."

      return NextResponse.json(
        { error: mensaje },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimit.motivo === "dia" ? "30" : "5",
            "X-RateLimit-Remaining": "0",
            "Retry-After": String(Math.ceil(rateLimit.resetEnMs / 1000)),
          },
        }
      )
    }
  }

  // ── 1. Leer y validar el body con Zod ────────────────────────────────────
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json(
      { error: "El body de la petición no es un JSON válido." },
      { status: 400 }
    )
  }

  const resultado = BodySchema.safeParse(rawBody)

  if (!resultado.success) {
    // Zod devuelve un array de errores — tomamos el primer mensaje.
    const mensaje = resultado.error.issues[0]?.message ?? "Datos inválidos."
    return NextResponse.json({ error: mensaje }, { status: 400 })
  }

  const { tematica } = resultado.data

  // ── 2. Generar texto ──────────────────────────────────────────────────────
  try {
    const texto = await generarTexto(tematica)

    return NextResponse.json({ texto, tematica })

  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido"

    return NextResponse.json(
      { error: `No se pudo generar el texto. Detalle: ${mensaje}` },
      { status: 503 }
    )
  }
}

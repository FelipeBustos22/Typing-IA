// Next.js nos da NextResponse para construir respuestas HTTP de forma cómoda.
// En particular, NextResponse.json() serializa un objeto como JSON y le pone
// automáticamente el header "Content-Type: application/json".
import { NextResponse } from "next/server"

// Importamos la función que creamos en la tarea anterior.
import { generarTexto } from "@/lib/ollama"

// ─── Tipos del request ─────────────────────────────────────────────────────────
// Tipamos el body que esperamos recibir en la petición.
// Si el cliente no manda esto exactamente, lo detectamos y respondemos con error.
interface IBodyRequest {
  tematica: string
}

// ─── Handler POST ──────────────────────────────────────────────────────────────
// Next.js ejecuta esta función cuando llega una petición POST a /api/texto-generado.
// El nombre "POST" no es arbitrario: debe coincidir exactamente con el método HTTP
export async function POST(request: Request) {
  // ── 1. Leer y validar el body ──────────────────────────────────────────────
  // request.json() parsea el body de la petición como JSON.
  // Es async porque leer el stream del body de red también es una operación
  // asíncrona, igual que el fetch a Ollama.

  let body: IBodyRequest

  try {
    body = await request.json()
  } catch {
    // Si el body no es JSON válido (o está vacío), request.json() lanza una
    // excepción. Respondemos con 400 Bad Request: el error es del cliente.
    return NextResponse.json(
      { error: "El body de la petición no es un JSON válido." },
      { status: 400 }
    )
  }

  // Validamos que la temática llegó y no está vacía.
  if (!body.tematica || body.tematica.trim() === "") {
    return NextResponse.json(
      { error: "El campo 'tematica' es obligatorio y no puede estar vacío." },
      { status: 400 }
    )
  }

  // ── 2. Llamar a Ollama ─────────────────────────────────────────────────────
  // Aquí delegamos todo el trabajo a lib/ollama.ts.
  // Este Route Handler no sabe nada sobre cómo construir el prompt, qué modelo
  // usar ni cómo parsear la respuesta de Ollama. Solo sabe que puede pedir un
  // texto y que a veces esa operación puede fallar.

  try {
    const texto = await generarTexto(body.tematica.trim())

    // ── 3. Responder al cliente ──────────────────────────────────────────────
    // Todo salió bien. Respondemos con 200 OK (status por defecto de NextResponse)
    // y el texto generado como JSON.
    // La forma del objeto que devolvemos coincide con ITextoGenerado de types/index.ts.
    return NextResponse.json({
      texto: texto,
      tematica: body.tematica.trim(),
    })

  } catch (error) {
    // generarTexto() puede lanzar un error si Ollama no está corriendo o si
    // responde con un código de error HTTP. Lo capturamos aquí y respondemos
    // con 503 Service Unavailable: el problema es del servidor, no del cliente.
    //
    // Convertimos el error a string para poder incluir el mensaje en la respuesta.
    const mensaje = error instanceof Error ? error.message : "Error desconocido"

    return NextResponse.json(
      { error: `No se pudo generar el texto. Detalle: ${mensaje}` },
      { status: 503 }
    )
  }
}

// ── Configuración por entorno ─────────────────────────────────────────────────
// Si GROQ_API_KEY existe, usamos Groq (producción).
// Si no existe, caemos a Ollama local (desarrollo).
// Esto se decide en tiempo de ejecución, no en tiempo de compilación.
const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_URL = process.env.GROQ_API_URL ?? "https://api.groq.com/openai/v1/chat/completions"
const GROQ_MODELO = "llama-3.3-70b-versatile" // Nombre exacto del modelo en Groq

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://127.0.0.1:11434/api/chat"
const OLLAMA_MODELO = process.env.OLLAMA_MODELO ?? "phi4-mini:3.8b"

// ─── Tipos internos ────────────────────────────────────────────────────────────

// Forma de la respuesta de Ollama (sin cambios)
interface IRespuestaOllama {
  message: {
    content: string
  }
}

// Groq sigue el estándar OpenAI. La respuesta viene dentro de un array "choices".
// Solo tipamos lo que necesitamos.
interface IRespuestaGroq {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

// ─── Funciones internas ────────────────────────────────────────────────────────

async function generarTextoConGroq(prompt: string): Promise<string> {
  const respuesta = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Groq requiere autenticación mediante un header Authorization.
      // El formato "Bearer <token>" es el estándar OAuth2 que usan la mayoría
      // de APIs de IA. Es básicamente decirle: "soy yo, aquí está mi credencial".
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODELO,
      messages: [
        { role: "user", content: prompt }
      ],
    }),
  })

  if (!respuesta.ok) {
    const detalle = await respuesta.text()
    console.log("Error Groq detalle:", detalle)
    throw new Error(
      `Groq respondió con error: ${respuesta.status} ${respuesta.statusText}`
    )
  }

  const datos: IRespuestaGroq = await respuesta.json()

  // En Groq la respuesta viene en choices[0]. El [0] es porque la API permite
  // pedir múltiples respuestas a la vez (nosotros pedimos solo una, la default).
  return datos.choices[0].message.content.trim()
}

async function generarTextoConOllama(prompt: string): Promise<string> {
  const respuesta = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OLLAMA_MODELO,
      messages: [
        { role: "user", content: prompt }
      ],
      stream: false,
    }),
  })

  if (!respuesta.ok) {
    throw new Error(
      `Ollama respondió con error: ${respuesta.status} ${respuesta.statusText}`
    )
  }

  const datos: IRespuestaOllama = await respuesta.json()
  return datos.message.content.trim()
}

// ─── Función principal ─────────────────────────────────────────────────────────

/**
 * Genera un texto sobre la temática recibida.
 * Usa Groq si GROQ_API_KEY está definida (producción).
 * Usa Ollama si no está definida (desarrollo local).
 */
export async function generarTexto(tematica: string): Promise<string> {
  const prompt = `Genera un párrafo corto (entre 50 y 80 palabras) sobre el tema: "${tematica}".
El texto debe ser fluido, en español, sin listas ni puntos. Solo prosa continua.
No incluyas ninguna introducción ni explicación. Responde únicamente con el párrafo.`

  // La decisión de qué proveedor usar ocurre aquí, en un solo lugar.
  // El Route Handler no sabe ni le importa cuál de los dos responde.
  if (GROQ_API_KEY) {
    return generarTextoConGroq(prompt)
  }

  return generarTextoConOllama(prompt)
}

// A partir de Ollama 0.5+, /api/generate fue reemplazado por /api/chat.
// /api/chat usa un formato de "mensajes" (igual que la API de OpenAI/ChatGPT)
// en lugar de un prompt de texto plano. La respuesta también tiene distinta forma.
const OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
const MODELO = "phi4-mini:3.8b"

// ─── Tipos internos ────────────────────────────────────────────────────────────
// Esta interfaz describe la forma del JSON que devuelve Ollama.
// Solo tipamos los campos que vamos a usar. Ollama devuelve más campos,
// pero TypeScript no se queja por ignorarlos si no los declaramos.

// /api/chat devuelve la respuesta dentro de un objeto "message" con un campo "content".
// La estructura es: { message: { role: "assistant", content: "texto generado..." } }
interface IRespuestaOllama {
  message: {
    content: string
  }
}

// ─── Función principal ─────────────────────────────────────────────────────────

/**
 * Pide a Ollama que genere un texto corto sobre la temática recibida.
 *
 * @param tematica - El tema sobre el que el modelo generará el texto.
 *                   Ejemplo: "programación", "historia", "ciencia".
 * @returns El texto generado, limpio y listo para usar en el juego.
 * @throws Error si Ollama no está disponible o devuelve una respuesta inválida.
 */

export async function generarTexto(tematica: string): Promise<string> {
  // Construimos el prompt aquí, no en el Route Handler.
  const prompt = `Genera un párrafo corto (entre 50 y 80 palabras) sobre el tema: "${tematica}".
El texto debe ser fluido, en español, sin listas ni puntos. Solo prosa continua.
No incluyas ninguna introducción ni explicación. Responde únicamente con el párrafo.`

  // fetch es la API estándar de JavaScript/Node.js para hacer peticiones HTTP.
  // Usamos await porque la llamada a Ollama es asíncrona: puede tardar varios
  // segundos mientras el modelo genera el texto.
  const respuesta = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODELO,
      // /api/chat no recibe un "prompt" de texto plano sino un array de "messages".
      // Cada mensaje tiene un "role" (quién habla) y un "content" (qué dice).
      // "user" es el turno del usuario. "assistant" sería la respuesta del modelo.
      messages: [
        { role: "user", content: prompt }
      ],
      stream: false,  // queremos la respuesta completa, no fragmento a fragmento
    }),
  })

  // Si Ollama responde con un código de error HTTP (4xx, 5xx), lo manejamos
  // aquí antes de intentar leer el body. response.ok es true solo para 2xx.
  if (!respuesta.ok) {
    throw new Error(
      `Ollama respondió con error: ${respuesta.status} ${respuesta.statusText}`
    )
  }

  // Parseamos el body como JSON y le decimos a TypeScript qué forma tiene
  // usando la interfaz IRespuestaOllama que definimos arriba.
  const datos: IRespuestaOllama = await respuesta.json()

  // Devolvemos solo el texto, sin espacios sobrantes al inicio o al final.
  // El resto del proyecto no necesita saber nada más sobre cómo funciona Ollama.
  // En /api/chat el texto generado está en datos.message.content, no en datos.response.
  return datos.message.content.trim()
}

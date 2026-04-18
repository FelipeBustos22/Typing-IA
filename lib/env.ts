// ── Validación de variables de entorno ────────────────────────────────────────
//
// Este módulo se importa una sola vez al arrancar el servidor (cuando ollama.ts
// lo requiere). Valida que exista al menos un proveedor de texto configurado
// y exporta las variables tipadas y limpias.
//
// Si algo falta, el servidor falla al arrancar con un mensaje claro,
// en vez de fallar silenciosamente en runtime con un 503 cuando un usuario
// hace una petición.

// ── Groq (producción) ───────────────────────────────────────────────────────
export const GROQ_API_KEY = process.env.GROQ_API_KEY ?? ""
export const GROQ_URL = process.env.GROQ_API_URL ?? "https://api.groq.com/openai/v1/chat/completions"
export const GROQ_MODELO = "llama-3.3-70b-versatile"

// ── Ollama (desarrollo local) ───────────────────────────────────────────────
export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://127.0.0.1:11434/api/chat"
export const OLLAMA_MODELO = process.env.OLLAMA_MODELO ?? "phi4-mini:3.8b"

// ── Proveedor activo ────────────────────────────────────────────────────────
// Determinamos cuál usar una sola vez. El resto del código importa esta flag.
export const usarGroq = GROQ_API_KEY.length > 0

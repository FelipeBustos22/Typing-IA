// ── Generador de texto ────────────────────────────────────────────────────────
//
// Punto de entrada para generar texto. Combina:
// - lib/prompts.ts → construye el prompt con los parámetros adecuados
// - lib/providers/ → ejecuta el prompt contra el proveedor activo (Groq/Ollama)
//
// El Route Handler solo necesita llamar a generarTexto(tematica).

import { construirPrompt } from "@/lib/prompts"
import { proveedor } from "@/lib/providers"

/**
 * Genera un texto sobre la temática recibida.
 * El proveedor (Groq o Ollama) se elige automáticamente según el entorno.
 */
export async function generarTexto(tematica: string): Promise<string> {
  const prompt = construirPrompt({ tematica })
  return proveedor.generar(prompt)
}

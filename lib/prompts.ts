// ── Constructor de prompts para generación de texto ──────────────────────────
//
// Centraliza la construcción de prompts para los proveedores de IA.
// Acepta parámetros que habilitan niveles de dificultad, idiomas
// y estilos de texto sin tocar la lógica de los proveedores.

interface IOpcionesPrompt {
  tematica: string
  // Rango de palabras: controla la longitud del texto generado.
  // Por defecto genera textos cortos (50-80 palabras).
  palabrasMin?: number
  palabrasMax?: number
  // Idioma del texto. Por defecto español.
  idioma?: string
}

/**
 * Construye el prompt para generar un texto de mecanografía.
 * Los proveedores (Groq, Ollama) reciben este string tal cual.
 */
export function construirPrompt({
  tematica,
  palabrasMin = 50,
  palabrasMax = 80,
  idioma = "español",
}: IOpcionesPrompt): string {
  return `Genera un párrafo corto (entre ${palabrasMin} y ${palabrasMax} palabras) sobre el tema: "${tematica}".
El texto debe ser fluido, en ${idioma}, sin listas ni puntos. Solo prosa continua.
No incluyas ninguna introducción ni explicación. Responde únicamente con el párrafo.`
}

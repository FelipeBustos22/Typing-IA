// ── Cliente API tipado ────────────────────────────────────────────────────────
//
// Centraliza todas las llamadas al backend en funciones tipadas.
// Los componentes importan estas funciones en vez de hacer fetch inline.
//
// Beneficios:
// - Un solo lugar para cambiar URLs, headers, manejo de errores
// - Fácil de mockear en tests
// - Agregar nuevos endpoints solo requiere una nueva función aquí

import type { ITextoGenerado } from "@/types"

/**
 * Pide al backend que genere un texto sobre la temática indicada.
 * Lanza un Error con mensaje descriptivo si la petición falla.
 */
export async function generarTextoAPI(tematica: string): Promise<ITextoGenerado> {
  const respuesta = await fetch("/api/texto-generado", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tematica }),
  })

  if (!respuesta.ok) {
    const datos = await respuesta.json()
    throw new Error(datos.error ?? `Error ${respuesta.status}`)
  }

  return respuesta.json()
}

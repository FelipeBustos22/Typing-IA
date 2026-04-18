import { GROQ_API_KEY, GROQ_URL, GROQ_MODELO } from "@/lib/env"
import type { IProveedorTexto } from "./types"

interface IRespuestaGroq {
  choices: Array<{
    message: { content: string }
  }>
}

export const groqProvider: IProveedorTexto = {
  nombre: "Groq",

  async generar(prompt: string): Promise<string> {
    const respuesta = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODELO,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    if (!respuesta.ok) {
      const detalle = await respuesta.text()
      console.error(`Error ${this.nombre}:`, detalle)
      throw new Error(
        `${this.nombre} respondió con error: ${respuesta.status} ${respuesta.statusText}`
      )
    }

    const datos: IRespuestaGroq = await respuesta.json()
    const contenido = datos.choices.at(0)?.message.content
    if (!contenido) throw new Error("Groq devolvió una respuesta vacía.")
    return contenido.trim()
  },
}

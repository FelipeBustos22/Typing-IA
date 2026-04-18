import { OLLAMA_URL, OLLAMA_MODELO } from "@/lib/env"
import type { IProveedorTexto } from "./types"

interface IRespuestaOllama {
  message: { content: string }
}

export const ollamaProvider: IProveedorTexto = {
  nombre: "Ollama",

  async generar(prompt: string): Promise<string> {
    const respuesta = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODELO,
        messages: [{ role: "user", content: prompt }],
        stream: false,
      }),
    })

    if (!respuesta.ok) {
      throw new Error(
        `${this.nombre} respondió con error: ${respuesta.status} ${respuesta.statusText}`
      )
    }

    const datos: IRespuestaOllama = await respuesta.json()
    return datos.message.content.trim()
  },
}

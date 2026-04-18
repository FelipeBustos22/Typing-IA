// ── Factory de proveedores ────────────────────────────────────────────────────
// Exporta el proveedor activo según la configuración de entorno.
// El resto del código importa `proveedor` sin saber cuál es.

import { usarGroq } from "@/lib/env"
import { groqProvider } from "./groq"
import { ollamaProvider } from "./ollama"
import type { IProveedorTexto } from "./types"

export const proveedor: IProveedorTexto = usarGroq ? groqProvider : ollamaProvider

export type { IProveedorTexto } from "./types"

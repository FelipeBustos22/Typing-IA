// ── Interfaz de proveedor de texto ────────────────────────────────────────────
//
// Contrato que deben cumplir todos los proveedores de generación de texto.
// Formaliza el Strategy pattern que ya existía implícitamente entre
// generarTextoConGroq y generarTextoConOllama.
//
// Agregar un nuevo proveedor (OpenAI, Claude, etc.) solo requiere
// implementar esta interfaz y registrarlo en la factory.

export interface IProveedorTexto {
  readonly nombre: string
  generar(prompt: string): Promise<string>
}

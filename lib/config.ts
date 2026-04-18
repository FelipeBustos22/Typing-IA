// ── Configuración centralizada del proyecto ──────────────────────────────────
//
// Todas las constantes "mágicas" que antes estaban dispersas por los componentes
// y módulos viven aquí. Un solo lugar para ajustar el comportamiento de la app.
//
// Beneficios:
// - Facilita agregar dificultad variable (cambiar longitud de texto)
// - A/B testing de prompts sin tocar lógica
// - Configuración por entorno si se necesita en el futuro

// ── Temáticas disponibles ────────────────────────────────────────────────────
// Antes vivían hardcodeadas en page.tsx. Al centralizarlas, una futura migración
// a base de datos solo cambia este archivo.
export const TEMATICAS = [
  "programación",
  "historia",
  "ciencia",
  "filosofía",
  "literatura",
] as const

export type Tematica = (typeof TEMATICAS)[number]

// ── Rate limiting ────────────────────────────────────────────────────────────
// Antes hardcodeados en lib/rate-limit.ts como constantes locales.
export const RATE_LIMIT = {
  maxPorMinuto: 5,
  ventanaMinutoMs: 60_000,
  maxPorDia: 30,
  ventanaDiaMs: 24 * 60 * 60_000,
  limpiezaIntervaloMs: 30 * 60 * 1000,
} as const

// ── Motor de tipeo ──────────────────────────────────────────────────────────
export const MOTOR = {
  // Cada cuántos ms se actualizan las métricas en vivo (WPM, precisión)
  metricasUpdateMs: 500,
  // Duración de la animación del contador de resultados
  contadorAnimacionMs: 800,
} as const

// ── Móvil ────────────────────────────────────────────────────────────────────
export const MOVIL = {
  // Si el viewport visual es menor que este % del viewport total,
  // consideramos que el teclado virtual está abierto.
  viewportUmbral: 0.85,
  // Delay del readOnly trick para forzar teclado en algunos navegadores
  readOnlyDelayMs: 50,
} as const

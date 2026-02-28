// ─── Funciones de cálculo ─────────────────────────────────────────────────────
//
// Estas son funciones PURAS: reciben datos y devuelven un resultado.
// No usan useState, no hacen fetch, no tocan el DOM.
//
// ¿Por qué funciones puras?
// Son las más fáciles de razonar y verificar. Dado el mismo input, siempre
// devuelven exactamente el mismo output. Si el WPM sale mal, el bug está aquí,
// no disperso por varios componentes. También son muy fáciles de testear.
//
// ─── Calcular WPM (palabras por minuto) ───────────────────────────────────────
//
// La fórmula estándar de mecanografía usa "palabras estándar" de 5 caracteres.
// No cuenta palabras reales separadas por espacios, sino que divide el total
// de caracteres entre 5. Esto normaliza el resultado independientemente del
// idioma o la longitud de las palabras.
//
// Fórmula:  WPM = (totalCaracteres / 5) / minutos
//
// Ejemplo:
//   300 caracteres en 60 segundos → (300/5) / 1 = 60 WPM
//   300 caracteres en 120 segundos → (300/5) / 2 = 30 WPM

export function calcularWpm(totalCaracteres: number, segundos: number): number {
  // Protección contra división por cero.
  // Si el tiempo es 0 (algo imposible en uso real, pero posible en un bug),
  // devolvemos 0 en vez de Infinity.
  if (segundos <= 0) return 0

  const palabrasEstandar = totalCaracteres / 5
  const minutos = segundos / 60
  const wpm = palabrasEstandar / minutos

  // Math.round redondea al entero más cercano.
  // No tiene sentido mostrar "67.384 WPM" — un entero es suficientemente preciso.
  return Math.round(wpm)
}

// ─── Calcular precisión (porcentaje de acierto) ──────────────────────────────
//
// Mide qué porcentaje de las pulsaciones fueron correctas.
//
// Fórmula:  precisión = ((totalPulsaciones - errores) / totalPulsaciones) * 100
//
// totalPulsaciones es el número total de caracteres del texto (cada carácter
// cuenta como una pulsación, porque siempre avanzamos el cursor incluso en error).
//
// Ejemplo:
//   200 pulsaciones, 10 errores → ((200 - 10) / 200) * 100 = 95%
//   200 pulsaciones, 0 errores  → ((200 - 0) / 200) * 100  = 100%

export function calcularPrecision(totalPulsaciones: number, errores: number): number {
  // Protección contra división por cero.
  if (totalPulsaciones <= 0) return 0

  const precision = ((totalPulsaciones - errores) / totalPulsaciones) * 100

  // Redondeamos a un decimal para dar un poco más de resolución que WPM.
  // Ejemplo: 97.3% en vez de 97%
  return Math.round(precision * 10) / 10
}

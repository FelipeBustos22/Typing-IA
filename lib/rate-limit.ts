// ── Rate Limiter en memoria — dos ventanas ─────────────────────────────────
//
// Protege el endpoint /api/texto-generado contra abuso de peticiones.
// Usa dos ventanas deslizantes simultáneas:
//
//   CORTA (1 minuto):  máx 5 peticiones → protege contra ráfagas repentinas
//   LARGA (24 horas):  máx 30 peticiones → protege la cuota diaria de la API
//
// ¿Por qué dos ventanas?
// El plan gratuito de Groq tiene dos límites independientes:
//   - 30 requests por minuto  (límite de Groq para el modelo)
//   - 1.000 requests por día  (límite TOTAL de toda la app)
//
// Una sola ventana de 1 minuto no protege el día. Con 10 req/min, una IP
// podría hacer 14.400 requests/día, agotando la cuota en ~2 horas.
// La ventana diaria por IP soluciona eso: aunque el servidor se reinicie,
// en condiciones normales de portfolio (10-20 visitantes) se mantiene
// muy por debajo del límite global de 1.000/día.
//
// ¿Se puede ver desde el navegador?
// NO. Todo corre en el servidor (Node.js). El cliente solo recibe
// 200 OK o 429 Too Many Requests. No puede inspeccionar el Map interno.

// ─── Configuración ────────────────────────────────────────────────────────────

const MAX_POR_MINUTO = 5          // máx 5 peticiones por minuto por IP
const VENTANA_MINUTO_MS = 60_000  // 60 segundos

const MAX_POR_DIA = 30                   // máx 30 peticiones por día por IP
const VENTANA_DIA_MS = 24 * 60 * 60_000  // 24 horas en milisegundos

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface IRegistroIP {
  // Guardamos todos los timestamps de peticiones del día.
  // Las peticiones del último minuto son un subconjunto de estas.
  // Un solo array es suficiente para derivar ambas ventanas filtrando por tiempo.
  peticiones: number[]
}

// ─── Almacén en memoria ───────────────────────────────────────────────────────
const registros = new Map<string, IRegistroIP>()

// ─── Función principal ────────────────────────────────────────────────────────

interface IResultadoRateLimit {
  permitido: boolean
  restantes: number    // slots restantes en la ventana más restrictiva
  resetEnMs: number    // ms hasta que se libere el próximo slot
  motivo?: "minuto" | "dia"  // qué ventana bloqueó la petición
}

/**
 * Verifica si una IP ha excedido alguno de los dos límites (minuto o día).
 * Se comprueba primero el límite de minuto (más frecuente), luego el diario.
 */
export function verificarRateLimit(ip: string): IResultadoRateLimit {
  const ahora = Date.now()
  const inicioMinuto = ahora - VENTANA_MINUTO_MS
  const inicioDia    = ahora - VENTANA_DIA_MS

  let registro = registros.get(ip)
  if (!registro) {
    registro = { peticiones: [] }
    registros.set(ip, registro)
  }

  // Limpiamos peticiones más antiguas que 24h (ya no importan para ninguna ventana)
  registro.peticiones = registro.peticiones.filter(t => t > inicioDia)

  // Derivamos los dos subconjuntos desde el mismo array
  const peticionesEnMinuto = registro.peticiones.filter(t => t > inicioMinuto)
  const peticionesEnDia    = registro.peticiones  // ya filtrado a 24h

  // ── Verificar ventana de minuto ────────────────────────────────────────────
  if (peticionesEnMinuto.length >= MAX_POR_MINUTO) {
    const masAntiguaEnMinuto = peticionesEnMinuto[0]
    return {
      permitido: false,
      restantes: 0,
      resetEnMs: masAntiguaEnMinuto + VENTANA_MINUTO_MS - ahora,
      motivo: "minuto",
    }
  }

  // ── Verificar ventana diaria ───────────────────────────────────────────────
  if (peticionesEnDia.length >= MAX_POR_DIA) {
    const masAntiguaEnDia = peticionesEnDia[0]
    return {
      permitido: false,
      restantes: 0,
      resetEnMs: masAntiguaEnDia + VENTANA_DIA_MS - ahora,
      motivo: "dia",
    }
  }

  // ── Petición permitida: registrar timestamp ────────────────────────────────
  registro.peticiones.push(ahora)

  // "restantes" refleja el límite más cercano a agotarse
  const restantesMinuto = MAX_POR_MINUTO - peticionesEnMinuto.length - 1
  const restantesDia    = MAX_POR_DIA    - peticionesEnDia.length    - 1
  const restantes = Math.min(restantesMinuto, restantesDia)

  return {
    permitido: true,
    restantes,
    resetEnMs: registro.peticiones[0] + VENTANA_MINUTO_MS - ahora,
  }
}

// ── Limpieza periódica ────────────────────────────────────────────────────────
// Cada 30 minutos eliminamos IPs sin actividad reciente en las últimas 24h.
if (typeof globalThis !== "undefined") {
  setInterval(() => {
    const ahora = Date.now()
    const inicioDia = ahora - VENTANA_DIA_MS

    for (const [ip, registro] of registros) {
      registro.peticiones = registro.peticiones.filter(t => t > inicioDia)
      if (registro.peticiones.length === 0) {
        registros.delete(ip)
      }
    }
  }, 30 * 60 * 1000) // cada 30 minutos
}

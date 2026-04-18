import { describe, it, expect, beforeEach, vi } from "vitest"

// Necesitamos resetear el módulo entre tests porque rate-limit.ts
// mantiene estado en un Map global.
let verificarRateLimit: typeof import("./rate-limit").verificarRateLimit

beforeEach(async () => {
  vi.resetModules()
  const mod = await import("./rate-limit")
  verificarRateLimit = mod.verificarRateLimit
})

describe("verificarRateLimit", () => {
  it("permite la primera petición de una IP", () => {
    const resultado = verificarRateLimit("1.2.3.4")
    expect(resultado.permitido).toBe(true)
    expect(resultado.restantes).toBeGreaterThanOrEqual(0)
  })

  it("permite hasta el máximo por minuto", () => {
    for (let i = 0; i < 5; i++) {
      const resultado = verificarRateLimit("test-ip")
      expect(resultado.permitido).toBe(true)
    }
  })

  it("bloquea después del máximo por minuto", () => {
    for (let i = 0; i < 5; i++) {
      verificarRateLimit("blocked-ip")
    }

    const resultado = verificarRateLimit("blocked-ip")
    expect(resultado.permitido).toBe(false)
    expect(resultado.motivo).toBe("minuto")
  })

  it("aísla peticiones de diferentes IPs", () => {
    // Agotamos el límite de una IP
    for (let i = 0; i < 5; i++) {
      verificarRateLimit("ip-saturada")
    }

    // Otra IP distinta debe seguir permitida
    const resultado = verificarRateLimit("ip-limpia")
    expect(resultado.permitido).toBe(true)
  })

  it("bloquea después del máximo diario", () => {
    for (let i = 0; i < 30; i++) {
      // Avanzamos el tiempo para no chocar con el límite por minuto
      vi.spyOn(Date, "now").mockReturnValue(Date.now() + i * 61_000)
      verificarRateLimit("heavy-user")
    }

    const resultado = verificarRateLimit("heavy-user")
    expect(resultado.permitido).toBe(false)
    expect(resultado.motivo).toBe("dia")
  })
})

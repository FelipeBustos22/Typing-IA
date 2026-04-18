import { describe, it, expect } from "vitest"
import { calcularWpm, calcularPrecision } from "./calculos"

describe("calcularWpm", () => {
  it("calcula correctamente para un caso estándar", () => {
    // 300 caracteres en 60 segundos = (300/5) / 1 = 60 WPM
    expect(calcularWpm(300, 60)).toBe(60)
  })

  it("calcula correctamente con tiempo mayor", () => {
    // 300 caracteres en 120 segundos = (300/5) / 2 = 30 WPM
    expect(calcularWpm(300, 120)).toBe(30)
  })

  it("devuelve 0 cuando el tiempo es 0", () => {
    expect(calcularWpm(100, 0)).toBe(0)
  })

  it("devuelve 0 cuando el tiempo es negativo", () => {
    expect(calcularWpm(100, -5)).toBe(0)
  })

  it("devuelve 0 cuando no hay caracteres", () => {
    expect(calcularWpm(0, 60)).toBe(0)
  })

  it("redondea al entero más cercano", () => {
    // 7 caracteres en 10 segundos = (7/5) / (10/60) = 1.4 / 0.1667 = 8.4 → 8
    expect(calcularWpm(7, 10)).toBe(8)
  })
})

describe("calcularPrecision", () => {
  it("calcula 100% cuando no hay errores", () => {
    expect(calcularPrecision(200, 0)).toBe(100)
  })

  it("calcula correctamente con errores", () => {
    // (200 - 10) / 200 * 100 = 95%
    expect(calcularPrecision(200, 10)).toBe(95)
  })

  it("calcula 0% cuando todo son errores", () => {
    expect(calcularPrecision(50, 50)).toBe(0)
  })

  it("devuelve 0 cuando no hay pulsaciones", () => {
    expect(calcularPrecision(0, 0)).toBe(0)
  })

  it("redondea a un decimal", () => {
    // (100 - 3) / 100 * 100 = 97.0
    expect(calcularPrecision(100, 3)).toBe(97)
    // (150 - 7) / 150 * 100 = 95.333... → 95.3
    expect(calcularPrecision(150, 7)).toBe(95.3)
  })
})

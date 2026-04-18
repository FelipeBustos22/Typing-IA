import { describe, it, expect } from "vitest"
import { construirPrompt } from "./prompts"

describe("construirPrompt", () => {
  it("incluye la temática en el prompt", () => {
    const prompt = construirPrompt({ tematica: "ciencia" })
    expect(prompt).toContain("ciencia")
  })

  it("usa valores por defecto (50-80 palabras, español)", () => {
    const prompt = construirPrompt({ tematica: "historia" })
    expect(prompt).toContain("50")
    expect(prompt).toContain("80")
    expect(prompt).toContain("español")
  })

  it("permite personalizar la longitud", () => {
    const prompt = construirPrompt({
      tematica: "filosofía",
      palabrasMin: 100,
      palabrasMax: 150,
    })
    expect(prompt).toContain("100")
    expect(prompt).toContain("150")
  })

  it("permite personalizar el idioma", () => {
    const prompt = construirPrompt({
      tematica: "science",
      idioma: "inglés",
    })
    expect(prompt).toContain("inglés")
  })
})

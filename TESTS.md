# Guía de tests

Este documento explica la estrategia de pruebas del proyecto, cómo ejecutarlas, qué se cubre actualmente y cómo añadir nuevos tests.

---

## Stack de testing

| Herramienta | Rol |
|---|---|
| [**Vitest**](https://vitest.dev) | Runner de tests, compatible con la API de Jest y con soporte nativo de TypeScript y ESM |
| [**jsdom**](https://github.com/jsdom/jsdom) | Implementación de DOM en Node, necesaria para pruebas que toquen APIs de navegador |
| [**@testing-library/react**](https://testing-library.com/react) | Utilidades para testear componentes React (disponible, aún sin tests de UI) |
| [**@testing-library/jest-dom**](https://github.com/testing-library/jest-dom) | Matchers adicionales para aserciones sobre el DOM |

La configuración vive en [`vitest.config.ts`](vitest.config.ts):

- `environment: "jsdom"` — simula el entorno de navegador
- `globals: true` — expone `describe`, `it`, `expect`, etc. sin imports (aunque los tests actuales los importan explícitamente para mayor claridad)
- alias `@` apuntando a la raíz del proyecto

---

## Cómo ejecutar los tests

```bash
# Una sola ejecución (ideal para CI o validación puntual)
npm test

# Modo watch: re-ejecuta automáticamente al guardar
npm run test:watch
```

Vitest imprime un resumen con los tests que pasan, fallan u omiten. En modo watch puedes filtrar por nombre de archivo o de test directamente desde la terminal interactiva.

### Ejecutar un archivo concreto

```bash
npx vitest run lib/calculos.test.ts
```

### Ejecutar un único test por nombre

```bash
npx vitest run -t "calcula 100% cuando no hay errores"
```

---

## Qué se prueba hoy

Los tests viven junto al código que cubren, con sufijo `.test.ts`:

```
lib/
  calculos.ts         ← código
  calculos.test.ts    ← test
  prompts.ts
  prompts.test.ts
  rate-limit.ts
  rate-limit.test.ts
```

### `lib/calculos.test.ts`

Funciones puras de cálculo:

- **`calcularWpm`** — palabras por minuto a partir de caracteres y tiempo. Cubre caso estándar, tiempos distintos, tiempo cero/negativo, caracteres en cero y redondeo al entero.
- **`calcularPrecision`** — porcentaje de precisión. Cubre 100%, con errores, 0%, sin pulsaciones y redondeo a un decimal.

### `lib/prompts.test.ts`

- **`construirPrompt`** — generación del prompt enviado al modelo. Verifica que incluya la temática, los valores por defecto (50-80 palabras, español) y que respete personalizaciones de longitud e idioma.

### `lib/rate-limit.test.ts`

- **`verificarRateLimit`** — limitador en memoria con dos ventanas (por minuto y por día). Cubre primera petición, límite por minuto, bloqueo tras el máximo, aislamiento entre IPs y bloqueo por cuota diaria.

---

## Patrones usados (y por qué)

### Reset de módulos para estado global

`rate-limit.ts` mantiene un `Map` a nivel de módulo. Si todos los tests compartieran el mismo módulo, los contadores se filtrarían entre pruebas y los resultados dependerían del orden de ejecución.

```ts
let verificarRateLimit: typeof import("./rate-limit").verificarRateLimit

beforeEach(async () => {
  vi.resetModules()
  const mod = await import("./rate-limit")
  verificarRateLimit = mod.verificarRateLimit
})
```

`vi.resetModules()` fuerza a Vitest a re-importar el módulo en cada test, empezando con un `Map` vacío.

### Mock de `Date.now` para avanzar el tiempo

Para probar el límite diario sin chocar con el límite por minuto, se avanza artificialmente el reloj:

```ts
vi.spyOn(Date, "now").mockReturnValue(Date.now() + i * 61_000)
```

Esto evita usar `sleep` o tiempos reales en los tests (lentos y frágiles).

### Tests de funciones puras

`calculos.ts` y `prompts.ts` son funciones puras sin dependencias: los tests simplemente llaman a la función y comparan la salida con `expect(...).toBe(...)`. Es el patrón más sencillo y el más valioso — mantener la lógica de negocio en funciones puras facilita enormemente el testing.

---

## Cómo añadir un nuevo test

1. Crea el archivo junto al módulo que pruebas, con sufijo `.test.ts`:
   ```
   lib/mi-modulo.ts
   lib/mi-modulo.test.ts
   ```
2. Estructura mínima:
   ```ts
   import { describe, it, expect } from "vitest"
   import { miFuncion } from "./mi-modulo"

   describe("miFuncion", () => {
     it("hace lo que debe en el caso feliz", () => {
       expect(miFuncion("entrada")).toBe("salida esperada")
     })
   })
   ```
3. Ejecuta `npm test` para verificar que pasa.

### Recomendaciones

- **Cubre los casos borde**: cero, negativos, strings vacíos, entradas inválidas.
- **Un concepto por `it`**: si el nombre del test necesita un "y", probablemente son dos tests.
- **Evita depender del orden**: cada test debe poder ejecutarse aislado. Si compartes estado, límpialo en `beforeEach`.
- **Mockea el tiempo y la aleatoriedad**, no los uses reales.
- **Para componentes React**, usa `@testing-library/react`:
   ```ts
   import { render, screen } from "@testing-library/react"
   import "@testing-library/jest-dom/vitest"
   ```


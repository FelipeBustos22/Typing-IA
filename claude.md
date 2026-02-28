# Contexto del Proyecto: typing-fb-ia

Este archivo es el documento de contexto persistente del proyecto. Cualquier agente IA que trabaje aquí debe leerlo antes de generar código, sugerencias o explicaciones. Su propósito es garantizar coherencia arquitectónica y comunicación adaptada al nivel del desarrollador.

---

## 1. Visión del Proyecto

Aplicación web de mecanografía al estilo **Monkeytype**, donde los textos para practicar no son estáticos sino generados dinámicamente por un **modelo de IA local** (Ollama corriendo en `localhost:11434`).

El flujo principal es:
1. El usuario elige una **temática** (ej: programación, historia, ciencia).
2. La aplicación solicita al modelo de IA que genere un texto corto sobre esa temática.
3. El texto generado aparece en pantalla y el usuario lo mecanografía.
4. La aplicación mide velocidad (WPM) y precisión en tiempo real.

El objetivo es combinar una herramienta de práctica de mecanografía con la variabilidad y personalización que ofrece la IA generativa local.

---

## 2. Stack Tecnológico

| Tecnología | Versión / Variante | Rol en el proyecto |
|---|---|---|
| **Next.js** | App Router | Framework principal. Maneja routing, Server Components y Route Handlers. |
| **React** | 19 | Librería de UI. Se usa dentro de Next.js, no de forma independiente. |
| **TypeScript** | Estricto | Tipado estático en todo el proyecto. |
| **Tailwind CSS** | v4 | Estilos utilitarios. Diseño oscuro, minimalista, alto contraste (inspirado en Monkeytype). |
| **Ollama** | API REST local en `localhost:11434` | Proveedor de IA. Ejecuta modelos como `llama3` localmente, sin dependencia de servicios en la nube. |

**Nota sobre Ollama:** No es una librería npm. Es un servidor local independiente con el que nos comunicamos mediante `fetch` estándar desde los Route Handlers de Next.js.

---

## 3. Estructura de Carpetas y Responsabilidades

```
typing-fb-ia/
│
├── app/                          # Núcleo de Next.js App Router
│   ├── layout.tsx                # Layout raíz. Server Component. Define estructura HTML global, fuentes y metadatos.
│   ├── page.tsx                  # Página principal (/). Server Component. Solo estructura y composición de componentes.
│   ├── globals.css               # Estilos globales. Variables CSS y reset base de Tailwind.
│   └── api/
│       └── texto-generado/
│           └── route.ts          # Route Handler. ÚNICO punto de contacto con Ollama. Recibe la temática, llama a Ollama y devuelve el texto generado.
│
├── componentes/                  # Componentes React reutilizables
│   │                             # Los componentes del motor de tipado viven aquí como Client Components.
│   │                             # Los componentes de layout estructural pueden ser Server Components.
│
├── lib/
│   └── ollama.ts                 # Funciones utilitarias para construir y ejecutar peticiones a la API de Ollama.
│                                 # Solo se importa desde Route Handlers (server-side), nunca desde componentes cliente.
│
├── types/
│   └── index.ts                  # Interfaces y tipos TypeScript compartidos en todo el proyecto.
│                                 # Convención: prefijo `I` para interfaces (ej: ITypingState, IGeneratedText).
│
├── public/                       # Archivos estáticos servidos directamente (imágenes, iconos, fuentes locales).
│
├── next.config.ts                # Configuración de Next.js.
├── tsconfig.json                 # Configuración de TypeScript.
├── postcss.config.mjs            # Configuración de PostCSS (requerido por Tailwind).
├── eslint.config.mjs             # Reglas de linting.
└── claude.md                     # Este archivo. Contexto persistente del proyecto para agentes IA.
```

---

## 4. Decisiones Arquitectónicas No Negociables

Estas decisiones están tomadas y no deben cuestionarse ni revertirse sin una razón de peso explícita.

### 4.1 Ollama solo desde el servidor

**Regla:** Todo acceso a la API de Ollama ocurre **exclusivamente desde Route Handlers** ubicados en `app/api/`. Jamás desde un componente cliente.

**Por qué:** Los Route Handlers se ejecutan en el servidor de Node.js. Desde el servidor podemos llamar a `localhost:11434` sin problema. Si intentáramos hacerlo desde el navegador del usuario, fallaría porque el `localhost` del navegador no es el mismo `localhost` donde corre Ollama.

### 4.2 Separación Server Components / Client Components

**Regla:**
- Los componentes del **motor de mecanografía** (captura de teclado, validación, contadores) son **Client Components** (`"use client"`).
- El **layout estructural** (cabecera, estructura de página, composición) son **Server Components** (sin directiva, comportamiento por defecto en App Router).

**Por qué:** Los Client Components son los únicos que pueden usar eventos del navegador (`onKeyDown`, `onClick`) y hooks como `useState` o `useRef`. Los Server Components se renderizan solo en el servidor y son más eficientes para contenido estático o estructural.

### 4.3 `useRef` vs `useState`

**Regla:** Usar `useRef` para valores mutables que **no necesitan provocar un re-renderizado** (ej: el timestamp de inicio, el índice actual del cursor). Usar `useState` únicamente para valores cuyo cambio **debe actualizar la UI visualmente**.

**Por qué:** Cada llamada a un setter de `useState` provoca que React re-renderice el componente. Si usamos `useState` para todo, el componente se re-renderiza con cada pulsación de teclado, lo que puede generar problemas de rendimiento. `useRef` permite mutar un valor sin disparar ese ciclo.

### 4.4 Sin React Compiler

**Regla:** No habilitar ni usar React Compiler (característica experimental de React 19).

**Por qué:** Introduce complejidad y comportamientos que aún no son estables. El proyecto prioriza claridad y control explícito sobre optimizaciones automáticas.

---

## 5. Perfil del Desarrollador (si soy yo jeje)

Este perfil determina **cómo debe comunicarse este agente**. Es la sección más importante para calibrar las respuestas.

- **Formación:** Ingeniero Informático recién egresado.
- **Experiencia previa:** Nivel medio-básico en Angular y Astro. Comprende bien la separación de responsabilidades, el tipado y la lógica de aplicación.
- **React y Next.js:** Principiante absoluto. No tiene experiencia previa práctica con el ecosistema React.

### Regla crítica de comunicación

Cuando se use cualquiera de los siguientes elementos, **siempre** debe incluirse una explicación del **por qué** de la decisión técnica, no solo mostrar el código:

- Hooks de React: `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`
- Conceptos del ciclo de vida del componente (montado, desmontado, re-renderizado)
- Diferencias entre Server Components y Client Components
- Conceptos de App Router (layouts, loading states, error boundaries)

**No asumir que el desarrollador conoce la terminología de React.** Si se usa un término específico del ecosistema (ej: "hidratación", "suspense", "reconciliación"), debe definirse brevemente en el mismo contexto.

---

## 6. Convenciones de Código del Proyecto

Estas convenciones deben respetarse en todo el código generado.

| Elemento | Convención | Ejemplo |
|---|---|---|
| Nombre de componentes React | PascalCase | `TypingBox`, `ThemeSelector` |
| Nombre de archivos de componentes | PascalCase | `TypingBox.tsx`, `ThemeSelector.tsx` |
| Funciones utilitarias | camelCase | `calcularWpm`, `normalizarTexto` |
| Interfaces TypeScript | Prefijo `I` + PascalCase | `ITypingState`, `IGeneratedText` |
| Directiva Client Component | Primera línea del archivo, antes de los imports | `"use client"` en línea 1 |
| Idioma del código | Español para nombres de dominio, inglés para términos técnicos estándar | `calcularPrecision`, `handleKeyDown` |

### Ejemplo de estructura de un Client Component correcto

```tsx
"use client"

import { useState, useRef } from "react"
import type { ITypingState } from "@/types"

interface IMotorTipeoProps {
  textoObjetivo: string
}

export default function MotorTipeo({ textoObjetivo }: IMotorTipeoProps) {
  // ...
}
```

---

## 7. Fases de Desarrollo

El proyecto se construye en fases secuenciales. **No se debe anticipar lógica de fases posteriores** mientras la fase actual no esté completa y validada.

### Fase 1 — Infraestructura (actual)

**Objetivo:** Conectar los puntos fundamentales del sistema antes de construir cualquier experiencia de usuario.

- [ ] Route Handler funcional en `app/api/texto-generado/route.ts` que recibe una temática y devuelve texto de Ollama.
- [ ] Función auxiliar en `lib/ollama.ts` para construir la petición a Ollama.
- [ ] Layout base con Tailwind (fondo oscuro, tipografía monoespaciada).
- [ ] Esqueleto de UI: selector de temática + área donde aparecerá el texto generado.
- [ ] Tipos base definidos en `types/index.ts`.

### Fase 2 — Motor de Tipado

**Objetivo:** Implementar la mecánica central de la práctica de mecanografía.

- [ ] Captura de eventos de teclado (`onKeyDown`) en el componente del motor.
- [ ] Validación carácter a carácter contra el texto objetivo.
- [ ] Feedback visual en tiempo real: texto correcto, incorrecto, pendiente.
- [ ] Cálculo de WPM (palabras por minuto) en tiempo real.
- [ ] Cálculo de precisión (porcentaje de caracteres correctos).
- [ ] Detección de fin de texto.

### Fase 3 — Refinamiento

**Objetivo:** Pulir la experiencia de usuario y añadir estadísticas finales.

- [ ] Pantalla de resultados al terminar (WPM final, precisión, tiempo).
- [ ] Animaciones y transiciones de UI.
- [ ] Manejo de errores: Ollama no disponible, timeout, respuesta vacía.
- [ ] Opción de reintentar o cambiar temática sin recargar la página.
- [ ] Accesibilidad básica (ARIA, navegación por teclado).

---

## 8. Lo que Este Agente NO Debe Hacer

- **No generar código sin explicar las decisiones técnicas relevantes** para un principiante en React. El código sin contexto no enseña.
- **No usar librerías externas** sin justificar explícitamente por qué son necesarias y por qué no se puede resolver con las herramientas ya disponibles en el stack.
- **No saltarse fases ni anticipar lógica de fases posteriores.** Si se está en Fase 1, no se implementa lógica de captura de teclado de Fase 2.
- **No asumir que el desarrollador conoce terminología de React** sin definirla. Términos como "hook", "re-render", "hidratación" o "efecto secundario" deben explicarse cuando se usan por primera vez en un contexto.
- **No proponer refactorizaciones** de código que funciona correctamente si no están alineadas con la fase actual de desarrollo.
- **No generar código incompleto** que requiera que el desarrollador "complete el resto" sin guía clara de cómo hacerlo.

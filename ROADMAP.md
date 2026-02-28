# ROADMAP — TypingAI

Plan de desarrollo ordenado y ejecutable. Cada tarea es pequeña, verificable y viene acompañada del concepto técnico que introduces al implementarla. No copies el código sin entender por qué está ahí.

---

## Fase 1 — Infraestructura Base

**Objetivo:** Que la aplicación pueda pedirle texto a Ollama y mostrarlo en pantalla, sin ninguna lógica de juego todavía.

---

### Tarea 1.1 — Definir los tipos base del proyecto

**Archivo:** `types/index.ts`

**Qué hace:** Define las interfaces TypeScript que describen la forma de los datos que va a manejar la aplicación: el texto generado por la IA y el estado del juego de mecanografía.

```ts
export interface ITextoGenerado {
  texto: string
  tematica: string
}

export interface IEstadoJuego {
  fase: "esperando" | "jugando" | "terminado"
  indicadorActual: number
  errores: number
}
```

**Concepto introducido — Interfaces TypeScript:**
Son contratos que definen exactamente qué campos tiene un objeto y de qué tipo son. Antes de escribir lógica, defines la forma de tus datos. Esto evita errores y hace el código autoexplicativo.

**Pregunta para reflexionar:** ¿Por qué conviene definir los tipos antes de implementar la lógica?

---

### Tarea 1.2 — Crear la función auxiliar para comunicarse con Ollama

**Archivo:** `lib/ollama.ts`

**Qué hace:** Encapsula la llamada HTTP a la API local de Ollama. Recibe una temática como string, construye el prompt, hace el `fetch` y devuelve el texto limpio que generó el modelo.

**Concepto introducido — Separación de responsabilidades:**
Este archivo no es React ni Next.js: es TypeScript puro. Separar la lógica de comunicación con Ollama aquí significa que si mañana cambias el modelo o la URL, solo tocas este archivo. El resto del proyecto no sabe cómo funciona Ollama, solo que puede pedirle un texto.

**Pregunta para reflexionar:** ¿Qué pasaría si pusieras este `fetch` directamente dentro del Route Handler? ¿Cuándo empezaría a ser un problema?

---

### Tarea 1.3 — Crear el Route Handler para Ollama

**Archivo:** `app/api/texto-generado/route.ts`

**Qué hace:** Expone el endpoint `POST /api/texto-generado`. Recibe una temática en el body de la petición, llama a la función del paso anterior, y devuelve el texto generado como JSON.

```ts
// Estructura esperada de la respuesta
{ texto: "El texto generado por el modelo..." }
```

**Concepto introducido — Route Handlers en Next.js:**
Son funciones que se ejecutan en el servidor cuando alguien hace una petición HTTP a una URL específica. No son componentes de React. Existen para que el cliente (el navegador) pueda comunicarse con recursos del servidor, como Ollama, sin exponer esa lógica al exterior.

**Pregunta para reflexionar:** ¿Por qué este archivo vive en `app/api/` y no en `componentes/`?

**Criterio de verificación de esta tarea:**
Usar una herramienta como Bruno, Postman o `curl` para hacer:
```
POST http://localhost:3000/api/texto-generado
Body: { "tematica": "programación" }
```
Y recibir un JSON con un texto coherente en respuesta. Si eso funciona, la capa de servidor está lista.

---

### Tarea 1.4 — Crear el Layout base con Tailwind

**Archivo:** `app/layout.tsx` (modificar el existente)

**Qué hace:** Establece el diseño visual global: fondo oscuro, fuente monoespaciada, estructura de columna centrada. Incluye una barra de navegación simple con el nombre de la aplicación.

**Concepto introducido — Layout en App Router:**
En Next.js App Router, `layout.tsx` es un Server Component especial que envuelve todas las páginas. Todo lo que pongas aquí aparece en cada ruta de la aplicación. Es el lugar correcto para cabeceras, fuentes y colores de fondo globales.

**Nota:** Este archivo es un Server Component porque no necesita interactividad. No tiene `"use client"`. React lo renderiza en el servidor y manda el HTML ya construido al navegador.

**Pregunta para reflexionar:** ¿Qué información o comportamiento NO debería estar en un `layout.tsx`?

---

### Tarea 1.5 — Crear el esqueleto de la página principal

**Archivo:** `app/page.tsx` (modificar el existente)

**Qué hace:** Renderiza la estructura visual de la página: un encabezado con el selector de temática (sin lógica todavía, solo el HTML/JSX estático), y un área reservada donde aparecerá el texto generado.

**Concepto introducido — Server Components:**
`page.tsx` es por defecto un Server Component. Eso significa que React lo ejecuta en el servidor, no en el navegador. No puede tener eventos (`onClick`, `onKeyDown`) ni estado (`useState`). Solo estructura y composición. Es deliberadamente simple.

**Pregunta para reflexionar:** Si un Server Component no puede tener `onClick`, ¿cómo va a reaccionar la app a las acciones del usuario?

---

### Tarea 1.6 — Crear el componente SelectorTematica

**Archivo:** `componentes/SelectorTematica.tsx` (nuevo)

**Qué hace:** Un Client Component que muestra una lista de botones con temáticas disponibles (ej: "programación", "ciencia", "historia"). Cuando el usuario hace clic en uno, llama a la API y actualiza el texto mostrado en pantalla.

**Concepto introducido — Client Components y `useState`:**
Este es el primer componente con `"use client"`. Necesita recordar qué temática eligió el usuario y qué texto devolvió la IA. Para eso usa `useState`: una función de React que permite guardar un valor que, cuando cambia, hace que el componente se redibuje automáticamente con el nuevo valor.

```tsx
"use client"

const [textoGenerado, setTextoGenerado] = useState<string>("")
```

Leer `textoGenerado` te da el valor actual. Llamar a `setTextoGenerado("nuevo texto")` actualiza ese valor y React redibuja el componente.

**Pregunta para reflexionar:** ¿Qué ocurre si usas una variable normal (`let texto = ""`) en lugar de `useState`? ¿Por qué no funcionaría?

---

### Criterio de éxito — Fase 1

La Fase 1 está completa cuando puedas:

1. Abrir la aplicación en el navegador y ver el layout oscuro con la fuente monoespaciada.
2. Hacer clic en una temática y ver cómo aparece un texto generado por Ollama en pantalla.
3. El texto viene de `POST /api/texto-generado`, no está escrito a mano en ningún componente.

Si los tres puntos funcionan, la infraestructura está lista. Pasa a la Fase 2.

---

## Fase 2 — Motor de Mecanografía

**Objetivo:** Implementar la mecánica central del juego: que el usuario pueda escribir sobre el texto generado y la app registre aciertos, errores, velocidad y tiempo.

---

### Tarea 2.1 — Crear el componente MotorTipeo (esqueleto)

**Archivo:** `componentes/MotorTipeo.tsx` (nuevo)

**Qué hace:** Crea el Client Component principal del juego. Por ahora, solo recibe el texto objetivo como prop y lo muestra en pantalla dividido en caracteres individuales (cada letra en su propio `<span>`). Sin lógica de teclado todavía.

**Concepto introducido — Props:**
Las props son los parámetros que le pasas a un componente de React, igual que los argumentos de una función. `textoObjetivo` le dice al motor qué texto debe mostrar. El componente no sabe ni le importa cómo se generó ese texto.

**Concepto introducido — Renderizado de listas con `.map()`:**
Para mostrar cada carácter en un `<span>` separado, harás:
```tsx
{textoObjetivo.split("").map((caracter, indice) => (
  <span key={indice}>{caracter}</span>
))}
```
El `key` es obligatorio: React lo usa internamente para identificar qué elementos cambiaron cuando necesita redibujar la lista.

---

### Tarea 2.2 — Capturar eventos de teclado

**Archivo:** `componentes/MotorTipeo.tsx` (modificar)

**Qué hace:** Agrega un listener de teclado al componente para que, cuando el usuario escriba, el componente reciba cada tecla pulsada. La tecla se compara con el carácter esperado en la posición actual.

**Concepto introducido — `useEffect`:**
`useEffect` es un hook que te permite ejecutar código como reacción a algo, por ejemplo, cuando el componente aparece en pantalla por primera vez. Se usa aquí para registrar el listener de teclado al montar el componente y eliminarlo cuando el componente desaparezca.

```tsx
useEffect(() => {
  window.addEventListener("keydown", handleKeyDown)
  return () => {
    window.removeEventListener("keydown", handleKeyDown)  // limpieza
  }
}, [])
```

La función que devuelves dentro del `useEffect` es la **función de limpieza**: se ejecuta cuando el componente se desmonta (desaparece de la pantalla). Si no la pones, el listener seguiría activo aunque el componente ya no exista, causando bugs difíciles de detectar.

**Concepto introducido — `useRef` para el índice actual:**
El índice del carácter en el que va el usuario no necesita redibujar la UI por sí solo (el redibujado lo dispara el cambio de color de los caracteres). Por eso se guarda en un `useRef`, no en un `useState`. Mutar un `ref` es instantáneo y no provoca re-renderizados innecesarios.

**Pregunta para reflexionar:** ¿Por qué el array de dependencias del `useEffect` está vacío (`[]`)? ¿Qué significa eso?

---

### Tarea 2.3 — Implementar el estado del juego

**Archivo:** `componentes/MotorTipeo.tsx` (modificar)

**Qué hace:** Agrega un `useState` que controla en qué fase está el juego: `"esperando"` (no ha empezado), `"jugando"` (el usuario está escribiendo) o `"terminado"` (llegó al final del texto). El juego pasa de `"esperando"` a `"jugando"` con la primera tecla pulsada, y a `"terminado"` cuando el índice llega al último carácter.

**Concepto introducido — Estado como máquina de estados:**
En lugar de usar múltiples booleanos (`estaJugando`, `haTerminado`), un único string con los tres valores posibles hace el código más predecible. En cada momento, el componente sabe exactamente en qué estado está y qué debería renderizar.

**Pregunta para reflexionar:** ¿Cuántos estados distintos puede tener simultáneamente este componente? ¿Podría estar "jugando" y "terminado" al mismo tiempo?

---

### Tarea 2.4 — Implementar el cronómetro

**Archivo:** `componentes/MotorTipeo.tsx` (modificar)

**Qué hace:** Registra el timestamp de inicio cuando el juego pasa a estado `"jugando"` y el timestamp de fin cuando llega a `"terminado"`. El tiempo transcurrido se usa para calcular WPM.

**Concepto introducido — `useRef` para timestamps:**
El tiempo de inicio no necesita que React redibuje nada cuando se guarda. Solo se necesita su valor más tarde para un cálculo. Por eso va en un `useRef`: es un cajón donde guardas un valor que persiste entre renderizados sin causarlos.

```tsx
const tiempoInicio = useRef<number | null>(null)
// Al iniciar: tiempoInicio.current = Date.now()
// Al terminar: const segundos = (Date.now() - tiempoInicio.current!) / 1000
```

---

### Tarea 2.5 — Calcular WPM y precisión

**Archivo:** `lib/calculos.ts` (nuevo)

**Qué hace:** Dos funciones puras que reciben los datos del juego y devuelven un número:
- `calcularWpm(totalCaracteres, segundos)` — divide caracteres entre 5 (palabra estándar) y luego entre el tiempo en minutos.
- `calcularPrecision(totalPulsaciones, errores)` — porcentaje de teclas correctas sobre el total.

**Concepto introducido — Funciones puras:**
Una función pura recibe datos y devuelve un resultado sin modificar nada externo. No usa `useState`, no hace `fetch`, no toca el DOM. Son las más fáciles de razonar y verificar: dado el mismo input, siempre dan el mismo output.

**Verificación:** Prueba estas funciones directamente en la consola del navegador antes de integrarlas.

---

### Tarea 2.6 — Mostrar métricas en tiempo real

**Archivo:** `componentes/MotorTipeo.tsx` (modificar)

**Qué hace:** Mientras el usuario escribe, muestra debajo del texto el WPM calculado hasta ese momento y el porcentaje de precisión, actualizándose con cada tecla.

**Concepto introducido — Re-renderizado controlado:**
Solo los valores que se muestran en pantalla necesitan estar en `useState`. El WPM y la precisión sí deben estar en `useState` porque su cambio debe reflejarse visualmente. El índice actual no, porque solo es un contador interno.

---

### Criterio de éxito — Fase 2

La Fase 2 está completa cuando puedas:

1. Generar un texto desde la Fase 1, hacer clic en el área de tipeo y empezar a escribir.
2. Ver que los caracteres correctos se marcan de un color y los incorrectos de otro.
3. Ver el WPM y la precisión actualizándose mientras escribes.
4. Al llegar al último carácter, el juego pasa a estado `"terminado"` y deja de capturar teclas.

Si los cuatro puntos funcionan, el motor está operativo. Pasa a la Fase 3.

---

## Fase 3 — Refinamiento y UX

**Objetivo:** Convertir el prototipo funcional en una experiencia de usuario completa, visualmente pulida y robusta frente a errores.

---

### Tarea 3.1 — Feedback visual por carácter

**Archivo:** `componentes/MotorTipeo.tsx` (modificar)

**Qué hace:** Cada `<span>` de carácter recibe una clase CSS de Tailwind según su estado: pendiente (gris), correcto (blanco o verde) o incorrecto (rojo). El carácter en la posición actual tiene un cursor parpadeante.

**Concepto introducido — Clases CSS condicionales:**
En React, las clases CSS se calculan dinámicamente en el render. Puedes usar template literals o librerías como `clsx` para construir el `className` según el estado de cada carácter.

```tsx
const clase = estado === "correcto" ? "text-green-400" : estado === "error" ? "text-red-500" : "text-gray-500"
```

---

### Tarea 3.2 — Pantalla de resultados finales

**Archivo:** `componentes/PantallaResultados.tsx` (nuevo)

**Qué hace:** Cuando el estado del juego es `"terminado"`, en lugar del texto de mecanografía se muestra esta pantalla con: WPM final, precisión final, tiempo total y un botón para reiniciar con un nuevo texto de la misma temática.

**Concepto introducido — Renderizado condicional:**
En React, mostrar u ocultar un componente es tan simple como una condición en el JSX:
```tsx
{estadoJuego === "terminado" ? <PantallaResultados /> : <MotorTipeo />}
```
No hay `display: none` ni manipulación del DOM. React decide qué renderizar según el estado.

---

### Tarea 3.3 — Selector de temática integrado

**Archivo:** `componentes/SelectorTematica.tsx` (modificar)

**Qué hace:** Refina el selector de temática para que el botón seleccionado quede visualmente activo, impide solicitar un nuevo texto mientras el estado del juego es `"jugando"`, y muestra un indicador de carga mientras Ollama está generando el texto.

**Concepto introducido — Estado de carga (`isLoading`):**
Cuando haces una llamada asíncrona (como el `fetch` a Ollama), hay un intervalo de tiempo en el que la UI debería comunicar que está esperando. Un simple `useState<boolean>` que se pone en `true` antes del `fetch` y en `false` cuando termina es suficiente para mostrar un spinner o deshabilitar botones.

---

### Tarea 3.4 — Manejo de errores de red

**Archivo:** `componentes/SelectorTematica.tsx` (modificar) y `app/api/texto-generado/route.ts` (modificar)

**Qué hace:** Si Ollama no está disponible o devuelve un error, la aplicación muestra un mensaje claro al usuario en lugar de romperse silenciosamente. El Route Handler devuelve códigos HTTP apropiados (503 si Ollama no responde) y el componente los maneja.

**Concepto introducido — Manejo de errores en `fetch`:**
Un `fetch` puede fallar de dos formas: error de red (lanza una excepción, necesita `try/catch`) o respuesta HTTP de error (no lanza excepción, hay que revisar `response.ok`). Ambos casos deben manejarse explícitamente.

---

### Tarea 3.5 — Pulido visual con Tailwind

**Archivos:** Todos los componentes existentes

**Qué hace:** Revisión final del diseño: consistencia tipográfica, espaciados, tamaños de fuente, transiciones CSS en el cambio de estado de los caracteres, diseño responsivo básico (que funcione en pantallas de distinto ancho).

**Concepto introducido — Tailwind como sistema de diseño:**
Tailwind no es solo clases CSS individuales. `text-4xl`, `font-mono`, `tracking-widest` aplicados de forma consistente construyen un lenguaje visual propio. Revisa la paleta de colores y la escala tipográfica una sola vez y aplícala uniformemente.

---

### Tarea 3.6 — Optimización de re-renderizados

**Archivos:** `componentes/MotorTipeo.tsx`

**Qué hace:** Revisa que el motor no esté re-renderizando componentes innecesariamente con cada pulsación de teclado. Asegura que los `useRef` estén usados donde corresponde y que los `useState` solo guarden lo que realmente necesita la UI.

**Concepto introducido — `useCallback`:**
Si pasas funciones como props a componentes hijos, React las recrea en cada render. `useCallback` memoriza la función y solo la recrea si cambian sus dependencias. Se usa con moderación, solo cuando el profiler del navegador muestra un problema real.

**Nota:** No optimices antes de medir. El profiler de React DevTools (extensión de navegador) te dice qué componentes se re-renderizan y con qué frecuencia.

---

### Criterio de éxito — Fase 3

La Fase 3 está completa cuando puedas:

1. Jugar una partida completa de principio a fin sin ningún error en consola.
2. Ver la pantalla de resultados con WPM, precisión y tiempo al terminar.
3. Reiniciar la partida con el botón y recibir un nuevo texto de Ollama.
4. Si Ollama está apagado, la app muestra un mensaje de error legible y no se rompe.
5. La UI se ve consistente y usable en una ventana de navegador estándar.

Si los cinco puntos funcionan, el proyecto está completo en su versión 1.0.

---

## Referencia rápida de conceptos

| Concepto | Cuándo usarlo |
|---|---|
| `useState` | Cuando un valor cambia y la UI debe reflejar ese cambio visualmente |
| `useRef` | Cuando necesitas guardar un valor entre renders sin que su cambio redibuje nada |
| `useEffect` | Cuando necesitas ejecutar código al montar/desmontar el componente o reaccionar a un cambio |
| `useCallback` | Cuando pasas una función como prop y quieres evitar que se recree en cada render |
| `"use client"` | Cuando el componente usa eventos, hooks o interactividad del navegador |
| Route Handler | Cuando necesitas ejecutar código en el servidor desde el cliente (llamadas a APIs privadas) |

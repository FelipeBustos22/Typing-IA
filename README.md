# typingAI_

Aplicación web de mecanografía donde los textos de práctica son generados en tiempo real por un modelo de inteligencia artificial.

El usuario elige una temática, la IA genera un párrafo original sobre ese tema, y la aplicación mide velocidad (WPM) y precisión mientras lo mecanografía.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwind-css)

---

## Proveedores de IA

El proyecto soporta dos proveedores que se seleccionan automáticamente según el entorno:

| Entorno | Proveedor | Requisito |
|---|---|---|
| **Local** (`npm run dev`) | [Ollama](https://ollama.com) — modelo local, sin internet | Ollama instalado en tu máquina |
| **Producción** (Vercel, etc.) | [Groq](https://groq.com) — API en la nube | Variable `GROQ_API_KEY` configurada |

La lógica es simple: si la variable `GROQ_API_KEY` existe en el entorno, se usa Groq. Si no existe, se usa Ollama local. No hay que cambiar ningún archivo.

---

## Requisitos previos (desarrollo local)

- **Node.js** 18.17 o superior
- **Ollama** instalado y corriendo — [ollama.com](https://ollama.com)
- Un modelo descargado en Ollama (por defecto `phi4-mini:3.8b`)

```bash
# Descargar el modelo en Ollama
ollama pull phi4-mini:3.8b
```

---

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/typing-fb-ia.git
cd typing-fb-ia

# Instalar dependencias
npm install

# Crear el archivo de variables de entorno
# (este archivo nunca se sube al repositorio)
cp .env.example .env.local
```

El `.env.local` por defecto apunta a Ollama local. No necesitas modificar nada para empezar:

```env
# Ollama (desarrollo local)
OLLAMA_URL=http://127.0.0.1:11434/api/chat
OLLAMA_MODELO=phi4-mini:3.8b

# Groq (opcional — solo para producción)
# GROQ_API_KEY=
```

---

## Ejecución

```bash
# 1. Iniciar Ollama (en una terminal)
ollama serve

# 2. Iniciar la aplicación (en otra terminal)
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Despliegue en producción

1. Despliega el repositorio en [Vercel](https://vercel.com) (o cualquier plataforma Node.js)
2. En el dashboard de tu plataforma, añade la variable de entorno:
   ```
   GROQ_API_KEY = tu_api_key_de_groq
   ```
3. La aplicación usará Groq automáticamente. No se requiere ningún otro cambio.

> El rate limiting (5 req/min, 30 req/día por IP) se activa automáticamente en producción para proteger la cuota de la API. En desarrollo local no aplica.

---

## Stack tecnológico

| Tecnología | Rol |
|---|---|
| **Next.js 16** (App Router) | Framework principal, routing, Server y Client Components |
| **React 19** | Librería de UI |
| **TypeScript** (modo estricto) | Tipado estático en todo el proyecto |
| **Tailwind CSS v4** | Estilos utilitarios con tokens de diseño personalizados |
| **Ollama** | Modelo de IA local para desarrollo |
| **Groq** | API de inferencia en la nube para producción |

---

## Estructura del proyecto

```
app/
  layout.tsx                  # Layout raíz (Server Component)
  page.tsx                    # Página principal
  globals.css                 # Tokens de diseño y animaciones CSS
  api/texto-generado/
    route.ts                  # Endpoint POST — orquesta IA y rate limiting
componentes/
  MotorTipeo.tsx              # Motor de mecanografía (Client Component)
  SelectorTematica.tsx        # Selector de temáticas + fetch a la API
  Navbar.tsx                  # Barra de navegación
lib/
  ollama.ts                   # Lógica de comunicación con Ollama y Groq
  rate-limit.ts               # Rate limiter en memoria (dos ventanas)
  calculos.ts                 # Funciones puras: WPM y precisión
types/
  index.ts                    # Interfaces TypeScript compartidas
```

---

## Seguridad

El proyecto aplica medidas de endurecimiento en la cadena de dependencias npm para proteger tanto la aplicacion en produccion como la maquina del desarrollador. Los detalles estan documentados en [`SEGURIDAD.md`](SEGURIDAD.md).

Puntos clave:
- Todas las dependencias estan fijadas a versiones exactas
- Los scripts de instalacion de paquetes terceros estan bloqueados por defecto (`.npmrc`)
- Las vulnerabilidades conocidas se parchean de forma controlada

Si encuentras un problema de seguridad, abre un issue o contacta al mantenedor directamente.

---

## Licencia

[MIT](LICENSE)

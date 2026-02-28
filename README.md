# typingAI_

Aplicación web de mecanografía donde los textos de práctica son generados en tiempo real por un modelo de inteligencia artificial local.

El usuario elige una temática, la IA genera un párrafo original sobre ese tema, y la aplicación mide velocidad (WPM) y precisión mientras el usuario lo mecanografía.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwind-css)

---

## Requisitos previos

- **Node.js** 18.17 o superior
- **Ollama** instalado y corriendo localmente — [ollama.com](https://ollama.com)
- Un modelo descargado en Ollama (por defecto se usa `phi4-mini:3.8b`)

```bash
# Instalar un modelo en Ollama (ejemplo)
ollama pull phi4-mini:3.8b
```

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/typing-fb-ia.git
cd typing-fb-ia

# Instalar dependencias
npm install

# Crear el archivo de variables de entorno
cp .env.example .env.local
```

Edita `.env.local` si necesitas cambiar la URL de Ollama o el modelo:

```env
OLLAMA_URL=http://127.0.0.1:11434/api/chat
OLLAMA_MODELO=phi4-mini:3.8b
```

## Ejecución

```bash
# Asegúrate de que Ollama está corriendo
ollama serve

# En otra terminal, inicia la aplicación
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Stack tecnológico

| Tecnología | Rol |
|---|---|
| **Next.js 16** (App Router) | Framework principal, routing y Server/Client Components |
| **React 19** | Librería de UI |
| **TypeScript** (modo estricto) | Tipado estático |
| **Tailwind CSS v4** | Estilos utilitarios |
| **Ollama** | Modelo de IA local (sin dependencia de servicios en la nube) |

## Estructura del proyecto

```
app/
  layout.tsx              # Layout raíz (Server Component)
  page.tsx                # Página principal
  globals.css             # Tokens de diseño y animaciones
  api/texto-generado/
    route.ts              # Endpoint que se comunica con Ollama
componentes/
  MotorTipeo.tsx          # Motor de mecanografía (Client Component)
  SelectorTematica.tsx    # Selector de temáticas + fetch a la API
  Navbar.tsx              # Barra de navegación
lib/
  ollama.ts               # Comunicación con la API de Ollama
  calculos.ts             # Funciones de cálculo (WPM, precisión)
types/
  index.ts                # Interfaces TypeScript compartidas
```

## Licencia

[MIT](LICENSE)

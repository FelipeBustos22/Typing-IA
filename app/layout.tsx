// layout.tsx es un Server Component: no tiene "use client", React lo ejecuta
// en el servidor y manda el HTML ya construido al navegador. Es el lugar
// correcto para metadatos, fuentes globales y estructura que envuelve TODO.

import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"
import "./globals.css"
import Navbar from "@/componentes/Navbar"

// Cargamos solo Geist Mono. Esta app es un juego de tipado monoespaciado:
// usar la misma fuente en la UI y en el texto del juego es una decisión
// deliberada que da coherencia visual.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  // Precargamos los pesos que vamos a usar para evitar flashes de texto.
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "typingAI — mecanografía con IA local",
  description:
    "Practica mecanografía con textos generados en tiempo real por un modelo de IA eligiendo la tematica que quieras!.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={geistMono.variable}>
      <body className="antialiased flex flex-col min-h-dvh bg-bg">
        <Navbar />

        {/* main crece para ocupar el espacio restante (flex-1),
            lo que empuja cualquier footer hacia abajo */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  )
}


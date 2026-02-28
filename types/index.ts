export interface ITextoGenerado {
    texto: string,
    tematica: string
}

export interface IEstadoJuego {
    fase: "esperando" | "jugando" | "terminado",
    indicadorActual: number,
    errores: number
}
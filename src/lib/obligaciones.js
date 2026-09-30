export const TIPOS_OBLIGACION = [
  { valor: 'POR_COBRAR', etiqueta: 'Por cobrar' },
  { valor: 'POR_PAGAR', etiqueta: 'Por pagar' },
  { valor: 'REPOSICION', etiqueta: 'Reposición' },
]

export const etiquetaObligacion = (tipo) => TIPOS_OBLIGACION.find((t) => t.valor === tipo)?.etiqueta ?? tipo

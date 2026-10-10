export const AJUSTES_FIN_SEMANA = [
  { valor: 'ANTERIOR', etiqueta: 'Día hábil anterior' },
  { valor: 'SIGUIENTE', etiqueta: 'Día hábil siguiente' },
  { valor: 'NINGUNO', etiqueta: 'Sin ajuste' },
]

const ETIQUETA_AJUSTE = {
  ANTERIOR: 'Si cae en fin de semana, el día hábil anterior',
  SIGUIENTE: 'Si cae en fin de semana, el día hábil siguiente',
  NINGUNO: 'Sin ajuste de fin de semana',
}
export const etiquetaAjuste = (ajuste) => ETIQUETA_AJUSTE[ajuste] ?? ajuste

// [10, 25] -> "Los días 10 y 25 de cada mes"; [31] -> "El último día de cada mes"
export function textoDias(dias) {
  const nombres = dias.map((d) => (d === 31 ? 'último' : String(d)))
  if (nombres.length === 1) return nombres[0] === 'último' ? 'El último día de cada mes' : `El día ${nombres[0]} de cada mes`
  const ultimo = nombres[nombres.length - 1]
  return `Los días ${nombres.slice(0, -1).join(', ')} y ${ultimo} de cada mes`
}

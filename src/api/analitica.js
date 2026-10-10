import { apiDescargar, apiGet } from './client'

const consulta = (idCiclo, ciclos) => `${idCiclo ? `id_ciclo=${idCiclo}&` : ''}ciclos=${ciclos}`

export const getAnalitica = (idCiclo, ciclos, opciones) => apiGet(`/analitica?${consulta(idCiclo, ciclos)}`, opciones)

// `secciones`: lista de claves a incluir (todas si se omite). `nombre` es el nombre del archivo descargado.
export const descargarAnalitica = (formato, idCiclo, ciclos, secciones, nombre) =>
  apiDescargar(
    `/analitica/exportar?formato=${formato}&${consulta(idCiclo, ciclos)}${secciones?.length ? `&secciones=${secciones.join(',')}` : ''}`,
    `${nombre}.${formato}`,
  )

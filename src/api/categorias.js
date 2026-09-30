import { apiDelete, apiGet, apiPost, apiPut } from './client'

export const getCategoriasDetalle = (opciones) => apiGet('/categorias-detalle', opciones)
export const getCategoriaDetalle = (id, opciones) => apiGet(`/categorias-detalle/${id}`, opciones)

export const crearCategoria = (categoria) => apiPost('/categorias', categoria)
export const actualizarCategoria = (id, categoria) => apiPut(`/categorias/${id}`, categoria)
export const eliminarCategoria = (id) => apiDelete(`/categorias/${id}`)

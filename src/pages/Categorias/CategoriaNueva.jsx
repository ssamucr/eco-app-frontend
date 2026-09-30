import { useNavigate } from 'react-router-dom'
import { crearCategoria } from '../../api/categorias'
import { EncabezadoFormulario, PaginaFormulario, VolverA } from '../../components/forms'
import CategoriaForm from './CategoriaForm'
import './categorias.css'

export default function CategoriaNueva() {
  const navigate = useNavigate()

  const guardar = async (cuerpo) => {
    await crearCategoria(cuerpo)
    navigate('/categorias', { state: { aviso: 'Categoría creada.' } })
  }

  return (
    <PaginaFormulario>
      <VolverA to="/categorias">Categorías</VolverA>
      <EncabezadoFormulario titulo="Nueva categoría" subtitulo="Para clasificar tus gastos y transferencias." />
      <CategoriaForm onGuardar={guardar} />
    </PaginaFormulario>
  )
}

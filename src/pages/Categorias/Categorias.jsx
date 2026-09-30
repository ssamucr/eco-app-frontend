import { Link } from 'react-router-dom'
import { getCategoriasDetalle } from '../../api/categorias'
import AccionesRapidas from '../../components/AccionesRapidas'
import Aviso from '../../components/Aviso'
import ConfirmDialog from '../../components/ConfirmDialog'
import ErrorCarga from '../../components/ErrorCarga'
import Icon from '../../components/Icon'
import { useAviso } from '../../hooks/useAviso'
import { useConfirmarEliminacion } from '../../hooks/useConfirmarEliminacion'
import { useRecurso } from '../../hooks/useRecurso'
import { plural } from '../../lib/format'
import { colorCategoria } from '../../lib/categorias'
import { eliminarCategoriaConfig } from './eliminaciones'
import './categorias.css'

function Fila({ categoria, onEliminar }) {
  return (
    <div className="category">
      <span className="category__dot" style={{ background: colorCategoria(categoria.id_categoria) }} aria-hidden="true" />
      <div className="category__main">
        <p className="category__name">{categoria.nombre}</p>
        <p className="category__meta">
          {[categoria.descripcion, categoria.movimientos > 0 && plural(categoria.movimientos, 'movimiento', 'movimientos')]
            .filter(Boolean)
            .join(' · ') || 'Sin movimientos'}
        </p>
      </div>
      <Link to={`/categorias/${categoria.id_categoria}/editar`} aria-label={`Editar ${categoria.nombre}`} className="icon-btn">
        <Icon nombre="editar" size={15} strokeWidth={1.6} />
      </Link>
      <button type="button" aria-label={`Eliminar ${categoria.nombre}`} className="icon-btn" onClick={() => onEliminar(categoria)}>
        <Icon nombre="eliminar" size={15} strokeWidth={1.6} />
      </button>
    </div>
  )
}

export default function Categorias() {
  const { data, error, loading, recargar } = useRecurso(getCategoriasDetalle)
  const { pedir, dialogoProps } = useConfirmarEliminacion()
  const [aviso, setAviso] = useAviso()

  const eliminar = (categoria) =>
    pedir(
      eliminarCategoriaConfig(categoria, () => {
        setAviso('Categoría eliminada.')
        recargar()
      }),
    )

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categorías</h1>
          <p className="page-subtitle">{data ? plural(data.length, 'categoría', 'categorías') : ' '}</p>
        </div>
        <AccionesRapidas />
      </div>

      <div className="page-toolbar">
        <Link to="/categorias/nueva" className="quickbtn quickbtn--primary quickbtn--lg">
          <Icon nombre="agregar" size={15} strokeWidth={2} />
          Nueva categoría
        </Link>
      </div>

      <Aviso mensaje={aviso} onCerrar={() => setAviso(null)} />

      {loading && !data && <div className="skeleton" style={{ height: 320 }} />}
      {error && <ErrorCarga titulo="No se pudieron cargar las categorías" error={error} onReintentar={recargar} />}
      {data && data.length === 0 && <p className="empty">Todavía no has creado categorías.</p>}

      {data && data.length > 0 && (
        <div className="card categories">
          {data.map((categoria) => (
            <Fila key={categoria.id_categoria} categoria={categoria} onEliminar={eliminar} />
          ))}
        </div>
      )}

      <ConfirmDialog {...dialogoProps} />
    </>
  )
}

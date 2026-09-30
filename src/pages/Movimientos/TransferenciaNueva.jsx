import { useNavigate, useSearchParams } from 'react-router-dom'
import { crearTransaccion, getOpcionesMovimiento } from '../../api/movimientos'
import ErrorCarga from '../../components/ErrorCarga'
import { EncabezadoFormulario, PaginaFormulario, VolverA } from '../../components/forms'
import { useRecurso } from '../../hooks/useRecurso'
import { TIPOS_TRANSACCION } from '../../lib/movimientos'
import TransferenciaForm from './TransferenciaForm'
import './movimientos.css'

const TITULOS = {
  TRANSFERENCIA: 'Nueva transferencia',
  PAGO_TARJETA: 'Nuevo pago a tarjeta',
  GASTO: 'Nuevo gasto',
  INGRESO: 'Nuevo ingreso',
}

export default function TransferenciaNueva() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const pedido = params.get('tipo')
  const tipoInicial = TIPOS_TRANSACCION.some((t) => t.valor === pedido) ? pedido : 'TRANSFERENCIA'
  const { data: opciones, error, loading, recargar } = useRecurso(getOpcionesMovimiento)

  const guardar = async (cuerpo) => {
    await crearTransaccion(cuerpo)
    navigate('/movimientos', { state: { aviso: 'Movimiento creado.' } })
  }

  return (
    <PaginaFormulario>
      <VolverA to="/movimientos">Movimientos</VolverA>
      <EncabezadoFormulario titulo={TITULOS[tipoInicial]} subtitulo="Registra un movimiento entre tus cuentas." />
      {loading && !opciones && <div className="skeleton" style={{ height: 520 }} />}
      {error && <ErrorCarga titulo="No se pudieron cargar los datos" error={error} onReintentar={recargar} />}
      {opciones && <TransferenciaForm opciones={opciones} tipoInicial={tipoInicial} onGuardar={guardar} />}
    </PaginaFormulario>
  )
}

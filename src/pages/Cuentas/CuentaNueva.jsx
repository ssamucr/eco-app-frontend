import { useNavigate } from 'react-router-dom'
import { crearCuenta } from '../../api/cuentas'
import { EncabezadoFormulario, PaginaFormulario, VolverA } from '../../components/forms'
import CuentaForm from './CuentaForm'
import './cuentas.css'

export default function CuentaNueva() {
  const navigate = useNavigate()

  const guardar = async (cuerpo) => {
    await crearCuenta(cuerpo)
    navigate('/cuentas', { state: { aviso: 'Cuenta creada.' } })
  }

  return (
    <PaginaFormulario>
      <VolverA to="/cuentas">Cuentas</VolverA>
      <EncabezadoFormulario titulo="Nueva cuenta" subtitulo="Completa los datos para agregar una cuenta a Eco." />
      <CuentaForm onGuardar={guardar} />
    </PaginaFormulario>
  )
}

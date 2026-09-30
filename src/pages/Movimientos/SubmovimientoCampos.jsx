import { Link } from 'react-router-dom'
import { Campo, InputMonto, InputTexto, Segmentado, Selector } from '../../components/forms'
import { dinero } from '../../lib/format'
import {
  TIPOS_SUBCUENTA,
  cuentasConSubcuentas,
  subcuentaTieneDestino,
  subcuentaTieneOrigen,
} from '../../lib/movimientos'
import { buscarCuenta, disponibleDeOrigen } from './submovimiento'

// Campos de un movimiento de subcuenta. `valor` son los textos del formulario; `alCambiar(parche)` los actualiza.
export default function SubmovimientoCampos({ idBase, opciones, valor, alCambiar, errores }) {
  const conSubcuentas = cuentasConSubcuentas(opciones)
  const cuenta = buscarCuenta(opciones, valor.cuenta)
  const subcuentas = (cuenta?.subcuentas ?? []).map((s) => ({
    valor: String(s.id_subcuenta),
    etiqueta: `${s.nombre} (${dinero(s.saldo)})`,
  }))
  const disponible = disponibleDeOrigen(valor, cuenta)
  const desdeSinAsignar = !subcuentaTieneOrigen(valor.tipo)

  // Al cambiar de tipo o de cuenta las subcuentas elegidas dejan de aplicar.
  const cambiarTipo = (tipo) => alCambiar({ tipo, origen: '', destino: '' })
  const cambiarCuenta = (id) => alCambiar({ cuenta: id, origen: '', destino: '' })

  if (conSubcuentas.length === 0) {
    return (
      <p className="form-error" role="alert">
        Todavía no hay subcuentas. <Link to="/cuentas">Crea una en Cuentas</Link> para poder mover saldo entre ellas.
      </p>
    )
  }

  return (
    <>
      <Segmentado id={`${idBase}-tipo`} etiqueta="Tipo" opciones={TIPOS_SUBCUENTA} valor={valor.tipo} onChange={cambiarTipo} />

      <Campo id={`${idBase}-cuenta`} etiqueta="Cuenta" error={errores.cuenta}>
        <Selector
          id={`${idBase}-cuenta`}
          valor={valor.cuenta}
          onChange={cambiarCuenta}
          error={errores.cuenta}
          opciones={conSubcuentas.map((c) => ({
            valor: String(c.id_cuenta),
            etiqueta: [c.nombre, c.entidad].filter(Boolean).join(' · '),
          }))}
        />
      </Campo>

      <Campo
        id={`${idBase}-origen`}
        etiqueta={desdeSinAsignar ? 'Origen' : 'Subcuenta origen'}
        error={errores.origen}
        ayuda={desdeSinAsignar ? 'Este movimiento sale del saldo sin asignar de la cuenta.' : undefined}
      >
        {desdeSinAsignar ? (
          <Selector
            id={`${idBase}-origen`}
            valor="sin"
            onChange={() => {}}
            disabled
            opciones={[{ valor: 'sin', etiqueta: `Sin asignar (${dinero(cuenta?.sin_asignar ?? 0)})` }]}
          />
        ) : (
          <Selector
            id={`${idBase}-origen`}
            valor={valor.origen}
            onChange={(origen) => alCambiar({ origen })}
            vacio="Selecciona una subcuenta"
            opciones={subcuentas}
            error={errores.origen}
          />
        )}
      </Campo>

      {subcuentaTieneDestino(valor.tipo) && (
        <Campo id={`${idBase}-destino`} etiqueta="Subcuenta destino" error={errores.destino}>
          <Selector
            id={`${idBase}-destino`}
            valor={valor.destino}
            onChange={(destino) => alCambiar({ destino })}
            vacio="Selecciona una subcuenta"
            opciones={subcuentas}
            error={errores.destino}
          />
        </Campo>
      )}

      <Campo id={`${idBase}-categoria`} etiqueta="Categoría" opcional>
        <Selector
          id={`${idBase}-categoria`}
          valor={valor.categoria}
          onChange={(categoria) => alCambiar({ categoria })}
          vacio="Sin categoría"
          opciones={opciones.categorias.map((c) => ({ valor: String(c.id_categoria), etiqueta: c.nombre }))}
        />
      </Campo>

      <Campo
        id={`${idBase}-monto`}
        etiqueta="Monto"
        error={errores.monto}
        ayuda={disponible != null ? `Disponible: ${dinero(Math.max(disponible, 0))}` : undefined}
      >
        <InputMonto
          id={`${idBase}-monto`}
          valor={valor.monto}
          onChange={(monto) => alCambiar({ monto })}
          error={errores.monto}
        />
      </Campo>

      <Campo id={`${idBase}-descripcion`} etiqueta="Descripción" opcional>
        <InputTexto
          id={`${idBase}-descripcion`}
          valor={valor.descripcion}
          onChange={(descripcion) => alCambiar({ descripcion })}
          placeholder="Ej. Ahorro programado, ajuste de metas..."
          maxLength={100}
        />
      </Campo>
    </>
  )
}

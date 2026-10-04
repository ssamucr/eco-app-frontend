import { Campo, InputMonto, InputTexto, Segmentado, Selector } from '../../components/forms'
import { TARJETA } from '../../lib/cuentas'
import { TIPOS_OBLIGACION } from '../../lib/obligaciones'

export const OBLIGACION_VACIA = {
  activa: false,
  persona: '',
  tipo: 'POR_COBRAR',
  concepto: '',
  monto: '',
  cuenta: '',
  subcuenta: '',
}

// Campos que faltan para crear una obligación a partir del gasto: lo demás (fecha, monto, concepto) sale de él.
export default function ObligacionDelGasto({ opciones, valor, alCambiar, errores, montoGasto, descripcionGasto }) {
  const cuenta = opciones.cuentas.find((c) => String(c.id_cuenta) === valor.cuenta)
  const subcuentas = cuenta && cuenta.tipo !== TARJETA ? cuenta.subcuentas : []

  return (
    <div>
      <label className="switch">
        <input type="checkbox" checked={valor.activa} onChange={(evento) => alCambiar({ activa: evento.target.checked })} />
        <span>Crear una obligación con este gasto (alguien me debe esta compra o debo reponerla)</span>
      </label>

      {valor.activa && (
        <div className="staged-form">
          <Segmentado id="oblg-tipo" etiqueta="Tipo" opciones={TIPOS_OBLIGACION} valor={valor.tipo} onChange={(tipo) => alCambiar({ tipo })} />

          <Campo id="oblg-persona" etiqueta="Persona" opcional={valor.tipo === 'REPOSICION'} error={errores.oblPersona}>
            <Selector
              id="oblg-persona"
              valor={valor.persona}
              onChange={(persona) => alCambiar({ persona })}
              vacio={valor.tipo === 'REPOSICION' ? 'Sin persona' : 'Selecciona una persona'}
              error={errores.oblPersona}
              opciones={opciones.personas.map((p) => ({ valor: String(p.id_persona), etiqueta: p.nombre }))}
            />
          </Campo>

          <div className="form-grid">
            <Campo
              id="oblg-monto"
              etiqueta="Monto de la obligación"
              opcional
              error={errores.oblMonto}
              ayuda={montoGasto ? 'Si lo dejas vacío es el total del gasto.' : undefined}
            >
              <InputMonto id="oblg-monto" valor={valor.monto} onChange={(monto) => alCambiar({ monto })} error={errores.oblMonto} />
            </Campo>
            <Campo id="oblg-concepto" etiqueta="Concepto" opcional>
              <InputTexto
                id="oblg-concepto"
                valor={valor.concepto}
                onChange={(concepto) => alCambiar({ concepto })}
                placeholder={descripcionGasto || 'Igual que el gasto'}
                maxLength={100}
              />
            </Campo>
          </div>

          <Campo
            id="oblg-cuenta"
            etiqueta="Dónde se salda: cuenta"
            error={errores.oblCuenta}
            ayuda="La cuenta a la que llega o de la que sale el dinero cuando se liquide."
          >
            <Selector
              id="oblg-cuenta"
              valor={valor.cuenta}
              onChange={(id) => alCambiar({ cuenta: id, subcuenta: '' })}
              vacio="Selecciona una cuenta"
              error={errores.oblCuenta}
              opciones={opciones.cuentas.map((c) => ({
                valor: String(c.id_cuenta),
                etiqueta: [c.nombre, c.entidad].filter(Boolean).join(' · '),
              }))}
            />
          </Campo>
          <Campo id="oblg-subcuenta" etiqueta="Dónde se salda: subcuenta" opcional>
            <Selector
              id="oblg-subcuenta"
              valor={valor.subcuenta}
              onChange={(subcuenta) => alCambiar({ subcuenta })}
              vacio="Ninguna"
              disabled={subcuentas.length === 0}
              opciones={subcuentas.map((s) => ({ valor: String(s.id_subcuenta), etiqueta: s.nombre }))}
            />
          </Campo>
        </div>
      )}
    </div>
  )
}

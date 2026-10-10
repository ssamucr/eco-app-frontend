import { Campo, Selector } from '../../components/forms'
import { TARJETA } from '../../lib/cuentas'
import { dinero } from '../../lib/format'

// Nombre del dinero que se mueve según el tipo de obligación: lo que sale de tu cuenta (por pagar, reposición)
// o lo que llega a ella (por cobrar).
export const esEntrada = (tipo) => tipo === 'POR_COBRAR'

const nombreCuenta = (c) => [c.nombre, c.entidad].filter(Boolean).join(' · ')

// Qué se registrará al liquidar, en una frase, para que no haya sorpresas.
export function resumenMovimientos({ tipo, cuentas, valor, destino }) {
  const cuenta = cuentas.find((c) => String(c.id_cuenta) === valor.cuenta)
  if (!cuenta) return null
  const sub = cuenta.subcuentas.find((s) => String(s.id_subcuenta) === valor.subcuenta)
  if (tipo === 'POR_PAGAR') {
    return `Se registra un gasto de «${cuenta.nombre}»${sub ? ` y un gasto de la subcuenta «${sub.nombre}»` : ''}.`
  }
  if (tipo === 'POR_COBRAR') {
    const verbo = cuenta.tipo === TARJETA ? 'un pago a la tarjeta' : 'un ingreso en'
    return `Se registra ${verbo} «${cuenta.nombre}»${sub ? ` y se asigna a la subcuenta «${sub.nombre}»` : ''}.`
  }
  if (!destino) return null
  const queEs = destino.tarjeta ? 'un pago a la tarjeta' : 'una transferencia a'
  const llegada = destino.subcuenta ? ` y se asigna a la subcuenta «${destino.subcuenta}»` : ''
  return `Se registra ${queEs} «${destino.cuenta}» desde «${cuenta.nombre}»${sub ? `, tomando de la subcuenta «${sub.nombre}»` : ''}${llegada}.`
}

// Cuenta y subcuenta de la liquidación. `valor` = { cuenta, subcuenta } (textos); `alCambiar(parche)`.
export default function OrigenLiquidacion({ tipo, cuentas, valor, alCambiar, errores = {}, idBase = 'liq' }) {
  const entrada = esEntrada(tipo)
  const candidatas = tipo === 'REPOSICION' ? cuentas.filter((c) => c.tipo !== TARJETA) : cuentas
  const cuenta = cuentas.find((c) => String(c.id_cuenta) === valor.cuenta)
  const subcuentas = cuenta && cuenta.tipo !== TARJETA ? cuenta.subcuentas : []
  const sinAsignar = cuenta && cuenta.tipo !== TARJETA ? Math.max(cuenta.sin_asignar, 0) : null

  return (
    <>
      <Campo
        id={`${idBase}-cuenta`}
        etiqueta={entrada ? 'Cuenta que recibe el dinero' : 'Cuenta de origen'}
        error={errores.cuenta}
        ayuda={
          sinAsignar != null
            ? entrada
              ? undefined
              : `Sin asignar en esta cuenta: ${dinero(sinAsignar)}`
            : undefined
        }
      >
        <Selector
          id={`${idBase}-cuenta`}
          valor={valor.cuenta}
          onChange={(id) => alCambiar({ cuenta: id, subcuenta: '' })}
          vacio="Selecciona una cuenta"
          error={errores.cuenta}
          opciones={candidatas.map((c) => ({ valor: String(c.id_cuenta), etiqueta: nombreCuenta(c), detalle: `Saldo ${dinero(c.saldo)}` }))}
        />
      </Campo>
      <Campo
        id={`${idBase}-subcuenta`}
        etiqueta={entrada ? 'Subcuenta que lo recibe' : 'Subcuenta de origen'}
        opcional
        ayuda={
          entrada
            ? 'Si eliges una, el dinero que llega se asigna a esa subcuenta.'
            : 'Si el dinero sale de una subcuenta, se descuenta de ella con este pago.'
        }
      >
        <Selector
          id={`${idBase}-subcuenta`}
          valor={valor.subcuenta}
          onChange={(subcuenta) => alCambiar({ subcuenta })}
          vacio={entrada ? 'Ninguna' : 'Ninguna (del saldo sin asignar)'}
          disabled={subcuentas.length === 0}
          opciones={subcuentas.map((s) => ({ valor: String(s.id_subcuenta), etiqueta: s.nombre, detalle: dinero(s.saldo) }))}
        />
      </Campo>
    </>
  )
}

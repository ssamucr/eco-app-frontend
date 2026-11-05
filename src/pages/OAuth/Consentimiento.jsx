import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ErrorFormulario } from '../../components/forms'
import { decidirAutorizacion, detallesAutorizacion } from '../../lib/oauth'
import { AUTH_ACTIVA } from '../../lib/sesion'
import '../Login/login.css'
import './consentimiento.css'

// Aplicaciones que se reconocen por el sitio al que vuelven (el nombre lo escribe la propia aplicacion, no es de fiar).
const SITIOS_CONOCIDOS = ['claude.ai', 'claude.com']

const sitioDe = (url) => {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export default function Consentimiento() {
  const [parametros] = useSearchParams()
  const idAutorizacion = parametros.get('authorization_id')
  const [detalles, setDetalles] = useState(null)
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!AUTH_ACTIVA || !idAutorizacion) return undefined
    let vigente = true
    detallesAutorizacion(idAutorizacion)
      .then((datos) => {
        if (!vigente) return
        // Ya se autorizo antes: Supabase devuelve directamente a donde volver.
        if (datos.redirect_url) {
          window.location.assign(datos.redirect_url)
        } else {
          setError(null)
          setDetalles(datos)
        }
      })
      .catch((falla) => vigente && setError(falla.message))
    return () => {
      vigente = false
    }
  }, [idAutorizacion])

  const decidir = async (accion) => {
    setEnviando(true)
    setError(null)
    try {
      const { redirect_url: destino } = await decidirAutorizacion(idAutorizacion, accion)
      window.location.assign(destino)
    } catch (falla) {
      setError(falla.message)
      setEnviando(false)
    }
  }

  const sitio = detalles ? sitioDe(detalles.redirect_uri) : ''
  const conocido = SITIOS_CONOCIDOS.some((s) => sitio === s || sitio.endsWith(`.${s}`))

  let cuerpo
  if (!AUTH_ACTIVA) cuerpo = <p className="login__subtitulo">El inicio de sesión no está configurado en este entorno.</p>
  else if (!idAutorizacion) cuerpo = <p className="login__subtitulo">Falta el identificador de la solicitud. Vuelve a conectar desde la aplicación que pidió el acceso.</p>
  else if (error && !detalles) cuerpo = <ErrorFormulario mensaje={error} />
  else if (!detalles) cuerpo = <div className="skeleton" style={{ height: 160 }} />
  else {
    cuerpo = (
      <>
        <div>
          <h1 className="login__titulo">¿Autorizar acceso a Eco?</h1>
          <p className="login__subtitulo">
            Cuenta: <strong>{detalles.user?.email}</strong>
          </p>
        </div>

        <dl className="consent__datos">
          <div>
            <dt>Aplicación</dt>
            <dd>{detalles.client?.name || 'Sin nombre'}</dd>
          </div>
          <div>
            <dt>Vuelve a</dt>
            <dd className={conocido ? '' : 'consent__alerta'}>{sitio}</dd>
          </div>
        </dl>

        {!conocido && (
          <p className="form-error" role="alert">
            Esta aplicación no es Claude. Autoriza solo si tú la conectaste y la reconoces.
          </p>
        )}

        <div className="consent__permisos">
          <strong>Podrá, a tu nombre:</strong>
          <ul>
            <li>Consultar tus cuentas, movimientos, ciclos, obligaciones y analítica.</li>
            <li>Registrar gastos, ingresos, transferencias, pagos de tarjeta y obligaciones.</li>
          </ul>
          <p>No podrá borrar ni editar lo ya registrado. Puedes revocar el acceso cuando quieras.</p>
        </div>

        <ErrorFormulario mensaje={error} />
        <div className="consent__acciones">
          <button type="button" className="btn" disabled={enviando} onClick={() => decidir('deny')}>
            Cancelar
          </button>
          <button type="button" className="btn btn--primary" disabled={enviando} onClick={() => decidir('approve')}>
            {enviando ? 'Un momento…' : 'Autorizar'}
          </button>
        </div>
      </>
    )
  }

  return (
    <main className="login">
      <div className="login__tarjeta form-card">
        <div className="login__marca">
          <div className="sidebar__logo">E</div>
          <span className="sidebar__name">Eco</span>
        </div>
        {cuerpo}
      </div>
    </main>
  )
}

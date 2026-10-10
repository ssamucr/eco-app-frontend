import { useState } from 'react'
import { AccionesFormulario, Campo, ErrorFormulario, InputTexto } from '../../components/forms'
import { iniciarSesion } from '../../lib/sesion'
import './login.css'

export default function Login() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const entrar = async (evento) => {
    evento.preventDefault()
    if (!correo.trim() || !contrasena) {
      setError('Escribe tu correo y tu contraseña.')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      await iniciarSesion(correo, contrasena)
    } catch (falla) {
      setError(falla.message)
      setEnviando(false)
    }
  }

  return (
    <main className="login">
      <form className="login__tarjeta form-card" onSubmit={entrar} noValidate>
        <div className="login__marca">
          <div className="sidebar__logo">E</div>
          <span className="sidebar__name">Eco</span>
        </div>
        <div>
          <h1 className="login__titulo">Inicia sesión</h1>
          <p className="login__subtitulo">Tus finanzas son privadas: solo tú puedes entrar.</p>
        </div>
        <Campo id="correo" etiqueta="Correo">
          <InputTexto id="correo" type="email" autoComplete="username" inputMode="email" valor={correo} onChange={setCorreo} autoFocus />
        </Campo>
        <Campo id="contrasena" etiqueta="Contraseña">
          <InputTexto id="contrasena" type="password" autoComplete="current-password" valor={contrasena} onChange={setContrasena} />
        </Campo>
        <ErrorFormulario mensaje={error} />
        <AccionesFormulario>
          <button type="submit" className="btn btn--primary" disabled={enviando}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </AccionesFormulario>
      </form>
    </main>
  )
}

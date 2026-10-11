import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/inter'
import './styles/tokens.css'
import './styles/global.css'
import './styles/shared.css'
import App from './App'
import './styles/movil.css' // al final: ajusta los estilos de cada pantalla para celular

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

// Iconos de trazo extraídos del diseño (viewBox 24x24, currentColor).
const ICONOS = {
  resumen: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </>
  ),
  cuentas: (
    <>
      <path d="M4 10 L12 4 L20 10" />
      <line x1="4" y1="10" x2="20" y2="10" />
      <line x1="6" y1="10" x2="6" y2="18" />
      <line x1="10" y1="10" x2="10" y2="18" />
      <line x1="14" y1="10" x2="14" y2="18" />
      <line x1="18" y1="10" x2="18" y2="18" />
      <line x1="4" y1="20" x2="20" y2="20" />
    </>
  ),
  transferencia: (
    <>
      <path d="M4 8h13M17 8l-3.5-3.5M17 8l-3.5 3.5" />
      <path d="M20 16H7M7 16l3.5-3.5M7 16l3.5 3.5" />
    </>
  ),
  personas: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
    </>
  ),
  categorias: (
    <>
      <path d="M11 3H5a2 2 0 0 0-2 2v6l10 10 8-8-10-10z" />
      <circle cx="7.5" cy="7.5" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  recurrente: (
    <>
      <path d="M4 9a8 8 0 0 1 14-4.9M20 4v5h-5" />
      <path d="M20 15a8 8 0 0 1-14 4.9M4 20v-5h5" />
    </>
  ),
  obligaciones: (
    <>
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="5" y1="7" x2="19" y2="7" />
      <path d="M5 7 L2.5 12 a3 3 0 0 0 5 0 Z" />
      <path d="M19 7 L16.5 12 a3 3 0 0 0 5 0 Z" />
    </>
  ),
  tarjeta: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <line x1="2.5" y1="9.5" x2="21.5" y2="9.5" />
      <line x1="6" y1="15" x2="11" y2="15" />
    </>
  ),
  cartera: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M3 10h18" />
      <circle cx="16.5" cy="13.5" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  ahorro: (
    <>
      <path d="M19 10.2c-.6-2.6-3.1-4.2-6.3-4.2H10C6.7 6 4 8.4 4 11.7c0 1.9.9 3.5 2.3 4.5V19h3v-1.5h5V19h3v-3c.8-.6 1.4-1.4 1.7-2.3H22v-3.5h-1.2" />
      <path d="M16.5 6.4 17.5 4l1.8 1.8" />
      <path d="M10 3.2h2.6" />
      <circle cx="15.7" cy="10.4" r=".7" fill="currentColor" stroke="none" />
    </>
  ),
  efectivo: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.8" />
      <path d="M6 9.5v.01M18 14.5v.01" />
    </>
  ),
  grafica: (
    <>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <rect x="7.5" y="12" width="3" height="5" rx=".6" />
      <rect x="12.5" y="8" width="3" height="9" rx=".6" />
      <rect x="17.5" y="5" width="2.6" height="12" rx=".6" />
    </>
  ),
  descargar: (
    <>
      <path d="M12 4v11" />
      <path d="M7.5 11l4.5 4.5 4.5-4.5" />
      <path d="M4.5 19.5h15" />
    </>
  ),
  menos: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </>
  ),
  mas: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="12" y1="8" x2="12" y2="16" />
    </>
  ),
  agregar: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  editar: (
    <>
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      <path d="M14.5 5.5l3 3" />
    </>
  ),
  eliminar: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V4.8c0-.4.3-.8.8-.8h4.4c.5 0 .8.4.8.8V7" />
      <path d="M6 7l1 12.5c0 .8.7 1.5 1.5 1.5h7c.8 0 1.5-.7 1.5-1.5L18 7" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  volver: <path d="M15 5l-7 7 7 7" />,
  siguiente: <path d="M9 5l7 7-7 7" />,
  calendario: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  ejecutar: <path d="M6 4l14 8-14 8V4z" />,
  check: <path d="M5 13l4 4L19 7" />,
  reloj: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  cerrar: (
    <>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="6" y1="18" x2="18" y2="6" />
    </>
  ),
}

export default function Icon({ nombre, size = 17, strokeWidth = 1.7 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONOS[nombre]}
    </svg>
  )
}

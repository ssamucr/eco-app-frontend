const numero = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// $1,234.50 · −$42.30 (con signo menos tipográfico, como en el diseño)
export function dinero(valor) {
  const texto = `$${numero.format(Math.abs(valor))}`
  return valor < 0 ? `−${texto}` : texto
}

// +$240.00 · −$50.00
export function dineroConSigno(valor) {
  if (valor === 0) return dinero(0)
  return valor < 0 ? dinero(valor) : `+${dinero(valor)}`
}

export function porcentaje(valor) {
  return `${Math.round(valor)}%`
}

// Limpia lo que se escribe en un input de dinero o porcentaje: la coma siempre se entiende como
// separador decimal (se convierte a punto), se descarta todo lo que no sea un dígito o un punto, y
// se limita la cantidad de dígitos enteros y decimales para que siempre entre en su columna de la BD.
export function sanitizarEntradaMonto(texto, digitosEnteros = 16) {
  const limpio = String(texto ?? '')
    .replace(/,/g, '.')
    .replace(/[^0-9.]/g, '')
  const puntos = limpio.includes('.') ? limpio.indexOf('.') : limpio.length
  const entero = limpio.slice(0, puntos).slice(0, digitosEnteros)
  const decimal = limpio.slice(puntos + 1).replace(/\./g, '').slice(0, 2)
  return limpio.includes('.') ? `${entero}.${decimal}` : entero
}

// Texto de un input de dinero -> número. Devuelve null si está vacío y NaN si no es un número válido.
export function parseMonto(texto) {
  const limpio = String(texto ?? '')
    .replace(/[$\s]/g, '')
    .replace(/,/g, '.')
  if (limpio === '') return null
  return /^-?(\d+\.?\d*|\.\d+)$/.test(limpio) ? Number(limpio) : NaN
}

// Número -> texto para un input de dinero: 3000 -> "3000.00" (sin separador de miles, para poder editarlo).
export function montoParaInput(valor) {
  return valor == null ? '' : Number(valor).toFixed(2)
}

export const plural = (cantidad, singular, plurales) => `${cantidad} ${cantidad === 1 ? singular : plurales}`

const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1)

// Las fechas llegan como "YYYY-MM-DD": se construyen en hora local para evitar el desfase de UTC.
export function parseFecha(iso) {
  const [anio, mes, dia] = iso.split('-').map(Number)
  return new Date(anio, mes - 1, dia)
}

// "27 sep" (el locale es trae "sept.": se normaliza a "sep")
const diaMesCorto = (fecha, conAnio = false) =>
  fecha
    .toLocaleDateString('es', { day: 'numeric', month: 'short', ...(conAnio && { year: 'numeric' }) })
    .replace(/\./g, '')
    .replace('sept', 'sep')

const mismoDia = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

// "Domingo, 27 de septiembre"
export function fechaLarga(iso) {
  return capitalizar(parseFecha(iso).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' }))
}

// "Septiembre 2026" a partir de "2026-09"
export function mesAnio(mesIso) {
  const fecha = parseFecha(`${mesIso}-01`)
  return `${capitalizar(fecha.toLocaleDateString('es', { month: 'long' }))} ${fecha.getFullYear()}`
}

// "9 oct"
export const diaMes = (iso) => diaMesCorto(parseFecha(iso))

// "9 oct – 22 oct 2026" (el año del inicio solo aparece si cambia de año)
export function rangoFechas(inicioIso, finIso) {
  const inicio = parseFecha(inicioIso)
  const fin = parseFecha(finIso)
  return `${diaMesCorto(inicio, inicio.getFullYear() !== fin.getFullYear())} – ${diaMesCorto(fin, true)}`
}

// "Hoy" · "Ayer" · "15 sep" · "15 sep 2025"
export function fechaRelativa(iso, hoyIso) {
  const fecha = parseFecha(iso)
  const hoy = parseFecha(hoyIso)
  if (mismoDia(fecha, hoy)) return 'Hoy'
  const ayer = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1)
  if (mismoDia(fecha, ayer)) return 'Ayer'
  return diaMesCorto(fecha, fecha.getFullYear() !== hoy.getFullYear())
}

// "15 sep 2026"
export const fechaCorta = (iso) => diaMesCorto(parseFecha(iso), true)

// La fecha de hoy como "YYYY-MM-DD" en hora local.
export function hoyIso() {
  const ahora = new Date()
  const dos = (n) => String(n).padStart(2, '0')
  return `${ahora.getFullYear()}-${dos(ahora.getMonth() + 1)}-${dos(ahora.getDate())}`
}

// Encabezado de un día en las listas: "Hoy, 27 sep" · "Ayer, 26 sep" · "24 de septiembre"
export function tituloDia(iso, hoy) {
  const relativa = fechaRelativa(iso, hoy)
  if (relativa === 'Hoy' || relativa === 'Ayer') {
    return `${relativa}, ${diaMesCorto(parseFecha(iso))}`
  }
  const opciones = { day: 'numeric', month: 'long' }
  if (parseFecha(iso).getFullYear() !== parseFecha(hoy).getFullYear()) opciones.year = 'numeric'
  return parseFecha(iso).toLocaleDateString('es', opciones)
}

export function iniciales(nombre) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join('')
}

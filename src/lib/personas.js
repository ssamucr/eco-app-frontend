const COLORES_AVATAR = ['#7c5cbf', '#1e8a8a', '#b7791f', '#52525b']
const COLOR_SIN_PERSONA = '#9c9c97'

export const colorAvatar = (idPersona) =>
  idPersona == null ? COLOR_SIN_PERSONA : COLORES_AVATAR[idPersona % COLORES_AVATAR.length]

// Cómo se lee un balance con una persona: positivo te debe, negativo le debes.
export function estadoBalance(balance) {
  if (balance > 0) return { texto: 'te debe', clase: 'positive' }
  if (balance < 0) return { texto: 'le debes', clase: 'negative' }
  return { texto: 'al día', clase: '' }
}

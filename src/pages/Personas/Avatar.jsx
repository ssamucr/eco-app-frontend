import { iniciales } from '../../lib/format'
import { colorAvatar } from '../../lib/personas'

export default function Avatar({ persona, grande = false }) {
  return (
    <div
      className={`person-avatar ${grande ? 'person-avatar--lg' : ''}`}
      style={{ background: colorAvatar(persona.id_persona) }}
      aria-hidden="true"
    >
      {iniciales(persona.nombre)}
    </div>
  )
}

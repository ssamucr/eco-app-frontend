export default function ErrorCarga({ titulo = 'No se pudo cargar la información', error, onReintentar }) {
  return (
    <div className="card error-card" role="alert">
      <p className="error-card__title">{titulo}</p>
      <p className="error-card__text">{error.message}</p>
      {onReintentar && (
        <button type="button" className="retry" onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </div>
  )
}

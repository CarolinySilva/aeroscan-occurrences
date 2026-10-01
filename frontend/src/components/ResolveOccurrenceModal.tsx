import type { Occurrence } from '../services/occurrences'

type ResolveOccurrenceModalProps = {
  occurrence: Occurrence
  note: string
  loading: boolean
  onNoteChange: (
    note: string,
  ) => void
  onClose: () => void
  onResolve: () => void
}

function formatType(
  type: Occurrence['type'],
) {
  const labels: Record<
    Occurrence['type'],
    string
  > = {
    intrusion: 'Intrusão',
    perimeter_breach:
      'Violação de perímetro',
    low_battery: 'Bateria baixa',
    signal_loss: 'Perda de sinal',
  }

  return labels[type]
}

function ResolveOccurrenceModal({
  occurrence,
  note,
  loading,
  onNoteChange,
  onClose,
  onResolve,
}: ResolveOccurrenceModalProps) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={onClose}
    >
      <div
        className="modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">
              RESOLUÇÃO
            </span>

            <h3>
              Resolver ocorrência
            </h3>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <p>
          Informe uma observação sobre a
          resolução de{' '}
          <strong>
            {formatType(occurrence.type)}
          </strong>
          .
        </p>

        <textarea
          value={note}
          onChange={(event) =>
            onNoteChange(event.target.value)
          }
          placeholder="Ex.: equipe verificou a área e confirmou que não há risco..."
          autoFocus
        />

        <div className="modal-actions">
          <button
            className="button button-secondary"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            className="button button-success"
            disabled={!note.trim() || loading}
            onClick={onResolve}
          >
            {loading
              ? 'Salvando...'
              : 'Confirmar resolução'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResolveOccurrenceModal
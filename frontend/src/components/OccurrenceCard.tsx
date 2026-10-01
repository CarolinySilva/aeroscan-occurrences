import type { Occurrence } from '../services/occurrences'

type OccurrenceCardProps = {
  occurrence: Occurrence
  actionLoading: string | null
  onAcknowledge: (
    occurrence: Occurrence,
  ) => void
  onResolve: (
    occurrence: Occurrence,
  ) => void
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

function formatStatus(
  status: Occurrence['status'],
) {
  const labels: Record<
    Occurrence['status'],
    string
  > = {
    open: 'Aberta',
    acknowledged: 'Reconhecida',
    resolved: 'Resolvida',
  }

  return labels[status]
}

function OccurrenceCard({
  occurrence,
  actionLoading,
  onAcknowledge,
  onResolve,
}: OccurrenceCardProps) {
  const isLoading =
    actionLoading === occurrence.id

  return (
    <article
      className="occurrence-card"
      key={occurrence.id}
    >
      <div className="card-main">
        <div className="occurrence-top">
          <div>
            <div className="occurrence-type-row">
              <span
                className={`severity severity-${occurrence.severity}`}
              >
                Severidade {occurrence.severity}
              </span>

              <h3>
                {formatType(occurrence.type)}
              </h3>
            </div>

            <span
              className={`status status-${occurrence.status}`}
            >
              {formatStatus(occurrence.status)}
            </span>
          </div>

          <div className="priority">
            <span>Prioridade</span>

            <strong>
              {occurrence.priority}
            </strong>
          </div>
        </div>

        <div className="occurrence-info">
          <div>
            <span>Site</span>

            <strong>
              {occurrence.siteId}
            </strong>
          </div>

          <div>
            <span>Drone</span>

            <strong>
              {occurrence.droneId}
            </strong>
          </div>

          <div>
            <span>Detectada em</span>

            <strong>
              {new Date(
                occurrence.detectedAt,
              ).toLocaleString('pt-BR')}
            </strong>
          </div>

          <div>
            <span>Repetições</span>

            <strong>
              {occurrence.count}x
            </strong>
          </div>
        </div>
      </div>

      <div className="card-actions">
        {occurrence.status === 'open' && (
          <button
            className="button button-primary"
            disabled={isLoading}
            onClick={() =>
              onAcknowledge(occurrence)
            }
          >
            {isLoading
              ? 'Salvando...'
              : 'Reconhecer'}
          </button>
        )}

        {occurrence.status ===
          'acknowledged' && (
          <button
            className="button button-success"
            onClick={() =>
              onResolve(occurrence)
            }
          >
            Resolver
          </button>
        )}

        {occurrence.status === 'resolved' && (
          <span className="resolved-label">
            ENCERRADA
          </span>
        )}
      </div>
    </article>
  )
}

export default OccurrenceCard
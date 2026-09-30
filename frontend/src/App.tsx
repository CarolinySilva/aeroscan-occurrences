import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import './App.css'

import {
  changeOccurrenceStatus,
  getOccurrences,
  type Occurrence,
  type OccurrenceStatus,
} from './services/occurrences'

function formatType(type: Occurrence['type']) {
  const labels: Record<Occurrence['type'], string> = {
    intrusion: 'Intrusão',
    perimeter_breach: 'Violação de perímetro',
    low_battery: 'Bateria baixa',
    signal_loss: 'Perda de sinal',
  }

  return labels[type]
}

function formatStatus(status: OccurrenceStatus) {
  const labels: Record<OccurrenceStatus, string> = {
    open: 'Aberta',
    acknowledged: 'Reconhecida',
    resolved: 'Resolvida',
  }

  return labels[status]
}

function App() {
  const [occurrences, setOccurrences] = useState<
    Occurrence[]
  >([])

  const [statusFilter, setStatusFilter] =
    useState<OccurrenceStatus | ''>('')

  const [siteFilter, setSiteFilter] = useState('')

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] =
    useState<string | null>(null)

  const [error, setError] = useState<string | null>(
    null,
  )

  const [
    resolvingOccurrence,
    setResolvingOccurrence,
  ] = useState<Occurrence | null>(null)

  const [resolutionNote, setResolutionNote] =
    useState('')

  const loadOccurrences = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getOccurrences({
        ...(statusFilter
          ? { status: statusFilter }
          : {}),
        ...(siteFilter.trim()
          ? { siteId: siteFilter.trim() }
          : {}),
      })

      setOccurrences(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao carregar ocorrências.',
      )
    } finally {
      setLoading(false)
    }
  }, [statusFilter, siteFilter])

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadOccurrences()
    }, 300)

    return () => clearTimeout(timeout)
  }, [loadOccurrences])

  const summary = useMemo(() => {
    return {
      total: occurrences.length,
      open: occurrences.filter(
        (occurrence) =>
          occurrence.status === 'open',
      ).length,
      acknowledged: occurrences.filter(
        (occurrence) =>
          occurrence.status === 'acknowledged',
      ).length,
    }
  }, [occurrences])

  async function handleAcknowledge(
    occurrence: Occurrence,
  ) {
    try {
      setActionLoading(occurrence.id)
      setError(null)

      await changeOccurrenceStatus(
        occurrence.id,
        'acknowledged',
      )

      await loadOccurrences()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao reconhecer ocorrência.',
      )
    } finally {
      setActionLoading(null)
    }
  }

  async function handleResolve() {
    if (!resolvingOccurrence) {
      return
    }

    if (!resolutionNote.trim()) {
      setError(
        'Informe uma observação para resolver a ocorrência.',
      )
      return
    }

    try {
      setActionLoading(resolvingOccurrence.id)
      setError(null)

      await changeOccurrenceStatus(
        resolvingOccurrence.id,
        'resolved',
        resolutionNote.trim(),
      )

      setResolvingOccurrence(null)
      setResolutionNote('')

      await loadOccurrences()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao resolver ocorrência.',
      )
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-icon">A</div>

          <div>
            <h1>AeroScan</h1>
            <span>Security Operations</span>
          </div>
        </div>

        <div className="system-status">
          <span className="status-dot" />
          Sistema operacional
        </div>
      </header>

      <main className="container">
        <section className="page-header">
          <div>
            <span className="eyebrow">
              MONITORAMENTO
            </span>

            <h2>Ocorrências</h2>

            <p>
              Acompanhe e gerencie eventos detectados
              pelos drones.
            </p>
          </div>

          <div className="summary">
            <div className="summary-item">
              <strong>{summary.total}</strong>
              <span>Total</span>
            </div>

            <div className="summary-item">
              <strong>{summary.open}</strong>
              <span>Abertas</span>
            </div>

            <div className="summary-item">
              <strong>
                {summary.acknowledged}
              </strong>
              <span>Reconhecidas</span>
            </div>
          </div>
        </section>

        <section className="filters">
          <div className="filter-group">
            <label htmlFor="status">Status</label>

            <select
              id="status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target
                    .value as OccurrenceStatus | '',
                )
              }
            >
              <option value="">Todos</option>
              <option value="open">
                Abertas
              </option>
              <option value="acknowledged">
                Reconhecidas
              </option>
              <option value="resolved">
                Resolvidas
              </option>
            </select>
          </div>

          <div className="filter-group site-filter">
            <label htmlFor="site">Site</label>

            <input
              id="site"
              value={siteFilter}
              onChange={(event) =>
                setSiteFilter(event.target.value)
              }
              type="text"
              placeholder="Buscar por site..."
            />
          </div>
        </section>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading ? (
          <div className="state-message">
            Carregando ocorrências...
          </div>
        ) : occurrences.length === 0 ? (
          <div className="state-message">
            Nenhuma ocorrência encontrada.
          </div>
        ) : (
          <section className="occurrences-list">
            {occurrences.map((occurrence) => (
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
                          {formatType(
                            occurrence.type,
                          )}
                        </h3>
                      </div>

                      <span
                        className={`status status-${occurrence.status}`}
                      >
                        {formatStatus(
                          occurrence.status,
                        )}
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
                  {occurrence.status ===
                    'open' && (
                    <button
                      className="button button-primary"
                      disabled={
                        actionLoading ===
                        occurrence.id
                      }
                      onClick={() =>
                        void handleAcknowledge(
                          occurrence,
                        )
                      }
                    >
                      {actionLoading ===
                      occurrence.id
                        ? 'Salvando...'
                        : 'Reconhecer'}
                    </button>
                  )}

                  {occurrence.status ===
                    'acknowledged' && (
                    <button
                      className="button button-success"
                      onClick={() => {
                        setError(null)
                        setResolutionNote('')
                        setResolvingOccurrence(
                          occurrence,
                        )
                      }}
                    >
                      Resolver
                    </button>
                  )}

                  {occurrence.status ===
                    'resolved' && (
                    <span className="resolved-label">
                      ENCERRADA
                    </span>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      {resolvingOccurrence && (
        <div
          className="modal-backdrop"
          onMouseDown={() =>
            setResolvingOccurrence(null)
          }
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
                <h3>Resolver ocorrência</h3>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setResolvingOccurrence(null)
                }
              >
                ×
              </button>
            </div>

            <p>
              Informe uma observação sobre a
              resolução de{' '}
              <strong>
                {formatType(
                  resolvingOccurrence.type,
                )}
              </strong>
              .
            </p>

            <textarea
              value={resolutionNote}
              onChange={(event) =>
                setResolutionNote(
                  event.target.value,
                )
              }
              placeholder="Ex.: equipe verificou a área e confirmou que não há risco..."
              autoFocus
            />

            <div className="modal-actions">
              <button
                className="button button-secondary"
                onClick={() =>
                  setResolvingOccurrence(null)
                }
              >
                Cancelar
              </button>

              <button
                className="button button-success"
                disabled={
                  !resolutionNote.trim() ||
                  actionLoading ===
                    resolvingOccurrence.id
                }
                onClick={() =>
                  void handleResolve()
                }
              >
                {actionLoading ===
                resolvingOccurrence.id
                  ? 'Salvando...'
                  : 'Confirmar resolução'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
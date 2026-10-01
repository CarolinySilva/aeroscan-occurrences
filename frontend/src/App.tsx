import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import './styles/App.css'

import Header from './components/Header'
import SummaryCards from './components/SummaryCards'
import OccurrenceFilters from './components/OccurrenceFilters'
import OccurrenceList from './components/OccurrenceList'
import ResolveOccurrenceModal from './components/ResolveOccurrenceModal'

import {
  changeOccurrenceStatus,
  getOccurrences,
  type Occurrence,
  type OccurrenceStatus,
} from './services/occurrences'

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
      setActionLoading(
        resolvingOccurrence.id,
      )

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

  function handleOpenResolveModal(
    occurrence: Occurrence,
  ) {
    setError(null)
    setResolutionNote('')
    setResolvingOccurrence(occurrence)
  }

  function handleCloseResolveModal() {
    setResolvingOccurrence(null)
    setResolutionNote('')
  }

  return (
    <div className="app">
      <Header />

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

          <SummaryCards summary={summary} />
        </section>

        <OccurrenceFilters
          statusFilter={statusFilter}
          siteFilter={siteFilter}
          setStatusFilter={setStatusFilter}
          setSiteFilter={setSiteFilter}
        />

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
          <OccurrenceList
            occurrences={occurrences}
            actionLoading={actionLoading}
            onAcknowledge={(occurrence) =>
              void handleAcknowledge(occurrence)
            }
            onResolve={handleOpenResolveModal}
          />
        )}
      </main>

      {resolvingOccurrence && (
        <ResolveOccurrenceModal
          occurrence={resolvingOccurrence}
          note={resolutionNote}
          loading={
            actionLoading ===
            resolvingOccurrence.id
          }
          onNoteChange={setResolutionNote}
          onClose={handleCloseResolveModal}
          onResolve={() =>
            void handleResolve()
          }
        />
      )}
    </div>
  )
}

export default App
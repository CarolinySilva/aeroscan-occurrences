import type { Dispatch, SetStateAction } from 'react'

import type { OccurrenceStatus } from '../services/occurrences'

type OccurrenceFiltersProps = {
  statusFilter: OccurrenceStatus | ''
  siteFilter: string
  setStatusFilter: Dispatch<
    SetStateAction<OccurrenceStatus | ''>
  >
  setSiteFilter: Dispatch<SetStateAction<string>>
}

function OccurrenceFilters({
  statusFilter,
  siteFilter,
  setStatusFilter,
  setSiteFilter,
}: OccurrenceFiltersProps) {
  return (
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
  )
}

export default OccurrenceFilters
import OccurrenceCard from './OccurrenceCard'

import type { Occurrence } from '../services/occurrences'

type OccurrenceListProps = {
  occurrences: Occurrence[]
  actionLoading: string | null
  onAcknowledge: (
    occurrence: Occurrence,
  ) => void
  onResolve: (
    occurrence: Occurrence,
  ) => void
}

function OccurrenceList({
  occurrences,
  actionLoading,
  onAcknowledge,
  onResolve,
}: OccurrenceListProps) {
  return (
    <section className="occurrences-list">
      {occurrences.map((occurrence) => (
        <OccurrenceCard
          key={occurrence.id}
          occurrence={occurrence}
          actionLoading={actionLoading}
          onAcknowledge={onAcknowledge}
          onResolve={onResolve}
        />
      ))}
    </section>
  )
}

export default OccurrenceList
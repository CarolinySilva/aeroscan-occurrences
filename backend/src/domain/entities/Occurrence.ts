import { randomUUID } from 'node:crypto'
import { DomainError } from '../errors/DomainError'
import { OccurrenceStatus } from '../enums/OccurrenceStatus'
import { OccurrenceType } from '../enums/OccurrenceType'

type OccurrenceProps = {
  id?: string
  siteId: string
  droneId: string
  type: OccurrenceType
  severity: number
  detectedAt: Date
  status?: OccurrenceStatus
  count?: number
  note?: string
}

export class Occurrence {
  public readonly id: string
  public readonly siteId: string
  public readonly droneId: string
  public readonly type: OccurrenceType
  public severity: number
  public readonly detectedAt: Date
  public status: OccurrenceStatus
  public count: number
  public note: string | undefined

  private constructor(props: OccurrenceProps) {
    if (props.severity < 1 || props.severity > 5) {
      throw new DomainError('Severity must be between 1 and 5')
    }

    this.id = props.id ?? randomUUID()
    this.siteId = props.siteId
    this.droneId = props.droneId
    this.type = props.type
    this.severity = props.severity
    this.detectedAt = props.detectedAt
    this.status = props.status ?? OccurrenceStatus.OPEN
    this.count = props.count ?? 1
    this.note = props.note
  }

  static create(props: OccurrenceProps) {
    return new Occurrence(props)
  }

  registerRepetition() {
    this.count += 1
    this.severity = Math.min(this.severity + 1, 5)
  }

  acknowledge() {
    if (this.status !== OccurrenceStatus.OPEN) {
      throw new DomainError('Only open occurrences can be acknowledged')
    }

    this.status = OccurrenceStatus.ACKNOWLEDGED
  }

  resolve(note: string) {
    if (this.status !== OccurrenceStatus.ACKNOWLEDGED) {
      throw new DomainError(
        'Only acknowledged occurrences can be resolved',
      )
    }

    if (!note.trim()) {
      throw new DomainError('Resolution note is required')
    }

    this.status = OccurrenceStatus.RESOLVED
    this.note = note
  }
}
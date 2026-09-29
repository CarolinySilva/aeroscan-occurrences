import { Occurrence } from '../../domain/entities/Occurrence'
import { OccurrenceType } from '../../domain/enums/OccurrenceType'

export type FindOpenRecentParams = {
  siteId: string
  type: OccurrenceType
  detectedAt: Date
  windowInMinutes: number
}

export interface OccurrenceRepository {
  findOpenRecent(
    params: FindOpenRecentParams,
  ): Promise<Occurrence | null>

  create(occurrence: Occurrence): Promise<Occurrence>

  save(occurrence: Occurrence): Promise<Occurrence>
}
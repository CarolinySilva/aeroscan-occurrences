import { Occurrence } from '../../domain/entities/Occurrence'
import { OccurrenceStatus } from '../../domain/enums/OccurrenceStatus'
import { OccurrenceType } from '../../domain/enums/OccurrenceType'

export type FindOpenRecentParams = {
  siteId: string
  type: OccurrenceType
  detectedAt: Date
  windowInMinutes: number
}

export type FindAllOccurrencesFilters = {
  status?: OccurrenceStatus
  siteId?: string
}

export interface OccurrenceRepository {
  findOpenRecent(
    params: FindOpenRecentParams,
  ): Promise<Occurrence | null>

  findAll(
    filters: FindAllOccurrencesFilters,
  ): Promise<Occurrence[]>

  findById(id: string): Promise<Occurrence | null>

  create(occurrence: Occurrence): Promise<Occurrence>

  save(occurrence: Occurrence): Promise<Occurrence>
}
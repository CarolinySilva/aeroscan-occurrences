import {
    FindAllOccurrencesFilters,
    OccurrenceRepository,
  } from '../ports/OccurrenceRepository'
  
  import { PriorityCalculator } from '../../domain/services/PriorityCalculator'
  
  export type ListOccurrenceItem = {
    id: string
    siteId: string
    droneId: string
    type: string
    severity: number
    detectedAt: Date
    status: string
    count: number
    note?: string
    priority: number
  }
  
  export class ListOccurrences {
    constructor(
      private readonly occurrenceRepository: OccurrenceRepository,
    ) {}
  
    async execute(
      filters: FindAllOccurrencesFilters,
    ): Promise<ListOccurrenceItem[]> {
      const occurrences =
        await this.occurrenceRepository.findAll(filters)
  
      return occurrences
        .map((occurrence) => ({
          id: occurrence.id,
          siteId: occurrence.siteId,
          droneId: occurrence.droneId,
          type: occurrence.type,
          severity: occurrence.severity,
          detectedAt: occurrence.detectedAt,
          status: occurrence.status,
          count: occurrence.count,
          ...(occurrence.note !== undefined
            ? { note: occurrence.note }
            : {}),
          priority: PriorityCalculator.calculate(
            occurrence.type,
            occurrence.severity,
          ),
        }))
        .sort((a, b) => {
          if (b.priority !== a.priority) {
            return b.priority - a.priority
          }
  
          return b.detectedAt.getTime() - a.detectedAt.getTime()
        })
    }
  }
import { OccurrenceRepository } from '../ports/OccurrenceRepository'

import { Occurrence } from '../../domain/entities/Occurrence'
import { OccurrenceType } from '../../domain/enums/OccurrenceType'

const DEDUPLICATION_WINDOW_IN_MINUTES = 10

export type RegisterOccurrenceInput = {
  siteId: string
  droneId: string
  type: OccurrenceType
  severity: number
  detectedAt: Date
}

export type RegisterOccurrenceOutput = {
  occurrence: Occurrence
  grouped: boolean
}

export class RegisterOccurrence {
  constructor(
    private readonly occurrenceRepository: OccurrenceRepository,
  ) {}

  async execute(
    input: RegisterOccurrenceInput,
  ): Promise<RegisterOccurrenceOutput> {
    const groupedOccurrence =
      await this.occurrenceRepository.findAndIncrementOpenRecent({
        siteId: input.siteId,
        type: input.type,
        detectedAt: input.detectedAt,
        windowInMinutes:
          DEDUPLICATION_WINDOW_IN_MINUTES,
      })

    if (groupedOccurrence) {
      return {
        occurrence: groupedOccurrence,
        grouped: true,
      }
    }

    const occurrence = Occurrence.create({
      siteId: input.siteId,
      droneId: input.droneId,
      type: input.type,
      severity: input.severity,
      detectedAt: input.detectedAt,
    })

    const createdOccurrence =
      await this.occurrenceRepository.create(
        occurrence,
      )

    return {
      occurrence: createdOccurrence,
      grouped: false,
    }
  }
}
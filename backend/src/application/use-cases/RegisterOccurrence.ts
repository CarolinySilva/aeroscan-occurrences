import { Occurrence } from '../../domain/entities/Occurrence'
import { OccurrenceType } from '../../domain/enums/OccurrenceType'
import { OccurrenceRepository } from '../ports/OccurrenceRepository'

const DEDUPLICATION_WINDOW_MINUTES = 10; 

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
    const existingOccurrence =
      await this.occurrenceRepository.findOpenRecent({
        siteId: input.siteId,
        type: input.type,
        detectedAt: input.detectedAt,
        windowInMinutes: DEDUPLICATION_WINDOW_MINUTES,
      })

    if (existingOccurrence) {
      existingOccurrence.registerRepetition()

      const occurrence =
        await this.occurrenceRepository.save(existingOccurrence)

      return {
        occurrence,
        grouped: true,
      }
    }

    const occurrence = Occurrence.create(input)

    const createdOccurrence =
      await this.occurrenceRepository.create(occurrence)

    return {
      occurrence: createdOccurrence,
      grouped: false,
    }
  }
}
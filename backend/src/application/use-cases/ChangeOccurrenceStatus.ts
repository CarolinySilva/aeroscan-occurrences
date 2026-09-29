import { OccurrenceRepository } from '../ports/OccurrenceRepository'

import { Occurrence } from '../../domain/entities/Occurrence'
import { OccurrenceStatus } from '../../domain/enums/OccurrenceStatus'
import { DomainError } from '../../domain/errors/DomainError'
import { OccurrenceNotFoundError } from '../../domain/errors/OccurrenceNotFoundError'

export type ChangeOccurrenceStatusInput = {
  id: string
  status: OccurrenceStatus
  note?: string
}

export class ChangeOccurrenceStatus {
  constructor(
    private readonly occurrenceRepository: OccurrenceRepository,
  ) {}

  async execute(
    input: ChangeOccurrenceStatusInput,
  ): Promise<Occurrence> {
    const occurrence =
      await this.occurrenceRepository.findById(input.id)

    if (!occurrence) {
      throw new OccurrenceNotFoundError()
    }

    switch (input.status) {
      case OccurrenceStatus.ACKNOWLEDGED:
        occurrence.acknowledge()
        break

      case OccurrenceStatus.RESOLVED:
        occurrence.resolve(input.note ?? '')
        break

      default:
        throw new DomainError(
          `Invalid target status: ${input.status}`,
        )
    }

    return this.occurrenceRepository.save(occurrence)
  }
}
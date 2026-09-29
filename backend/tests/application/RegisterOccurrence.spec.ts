import { describe, expect, it } from '@jest/globals'

import {
  FindOpenRecentParams,
  OccurrenceRepository,
} from '../../src/application/ports/OccurrenceRepository'

import {
  RegisterOccurrence,
  RegisterOccurrenceInput,
} from '../../src/application/use-cases/RegisterOccurrence'

import { Occurrence } from '../../src/domain/entities/Occurrence'
import { OccurrenceStatus } from '../../src/domain/enums/OccurrenceStatus'
import { OccurrenceType } from '../../src/domain/enums/OccurrenceType'

class InMemoryOccurrenceRepository
  implements OccurrenceRepository
{
  public items: Occurrence[] = []

  async findOpenRecent(
    params: FindOpenRecentParams,
  ): Promise<Occurrence | null> {
    const lowerBound = new Date(
      params.detectedAt.getTime() -
        params.windowInMinutes * 60 * 1000,
    )

    return (
      this.items
        .filter(
          (occurrence) =>
            occurrence.status === OccurrenceStatus.OPEN,
        )
        .filter(
          (occurrence) =>
            occurrence.siteId === params.siteId,
        )
        .filter(
          (occurrence) =>
            occurrence.type === params.type,
        )
        .filter(
          (occurrence) =>
            occurrence.detectedAt >= lowerBound &&
            occurrence.detectedAt <= params.detectedAt,
        )[0] ?? null
    )
  }

  async create(
    occurrence: Occurrence,
  ): Promise<Occurrence> {
    this.items.push(occurrence)

    return occurrence
  }

  async save(
    occurrence: Occurrence,
  ): Promise<Occurrence> {
    return occurrence
  }
}

function makeInput(
  overrides: Partial<RegisterOccurrenceInput> = {},
): RegisterOccurrenceInput {
  return {
    siteId: 'site-01',
    droneId: 'drone-01',
    type: OccurrenceType.INTRUSION,
    severity: 3,
    detectedAt: new Date(
      '2026-09-29T15:00:00.000Z',
    ),
    ...overrides,
  }
}

function makeSut() {
  const repository =
    new InMemoryOccurrenceRepository()

  const useCase =
    new RegisterOccurrence(repository)

  return {
    repository,
    useCase,
  }
}

describe('RegisterOccurrence', () => {
  it('creates a new occurrence when no recent match exists', async () => {
    const { repository, useCase } = makeSut()

    const result =
      await useCase.execute(makeInput())

    expect(result.grouped).toBe(false)
    expect(repository.items).toHaveLength(1)
    expect(result.occurrence.count).toBe(1)
    expect(result.occurrence.severity).toBe(3)
  })

  it('groups a repeated occurrence from the same site and type', async () => {
    const { repository, useCase } = makeSut()

    await useCase.execute(
      makeInput({
        detectedAt: new Date(
          '2026-09-29T15:00:00.000Z',
        ),
      }),
    )

    const result =
      await useCase.execute(
        makeInput({
          droneId: 'drone-99',
          detectedAt: new Date(
            '2026-09-29T15:05:00.000Z',
          ),
        }),
      )

    expect(result.grouped).toBe(true)
    expect(repository.items).toHaveLength(1)
    expect(result.occurrence.count).toBe(2)
    expect(result.occurrence.severity).toBe(4)
  })

  it('keeps severity capped at 5', async () => {
    const { useCase } = makeSut()

    await useCase.execute(
      makeInput({
        severity: 5,
      }),
    )

    const result =
      await useCase.execute(
        makeInput({
          detectedAt: new Date(
            '2026-09-29T15:03:00.000Z',
          ),
        }),
      )

    expect(result.grouped).toBe(true)
    expect(result.occurrence.severity).toBe(5)
  })

  it('creates a new occurrence outside the 10-minute window', async () => {
    const { repository, useCase } = makeSut()

    await useCase.execute(
      makeInput({
        detectedAt: new Date(
          '2026-09-29T15:00:00.000Z',
        ),
      }),
    )

    const result =
      await useCase.execute(
        makeInput({
          detectedAt: new Date(
            '2026-09-29T15:11:00.000Z',
          ),
        }),
      )

    expect(result.grouped).toBe(false)
    expect(repository.items).toHaveLength(2)
  })

  it('does not group an acknowledged occurrence', async () => {
    const { repository, useCase } = makeSut()

    const firstResult =
      await useCase.execute(makeInput())

    firstResult.occurrence.acknowledge()

    const secondResult =
      await useCase.execute(
        makeInput({
          detectedAt: new Date(
            '2026-09-29T15:05:00.000Z',
          ),
        }),
      )

    expect(secondResult.grouped).toBe(false)
    expect(repository.items).toHaveLength(2)
  })
})
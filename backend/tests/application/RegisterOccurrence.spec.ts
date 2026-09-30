import {
  beforeEach,
  describe,
  expect,
  it,
} from '@jest/globals'

import {
  FindAllOccurrencesFilters,
  FindOpenRecentParams,
  OccurrenceRepository,
} from '../../src/application/ports/OccurrenceRepository'
import { RegisterOccurrence } from '../../src/application/use-cases/RegisterOccurrence'
import { Occurrence } from '../../src/domain/entities/Occurrence'
import { OccurrenceStatus } from '../../src/domain/enums/OccurrenceStatus'
import { OccurrenceType } from '../../src/domain/enums/OccurrenceType'

class InMemoryOccurrenceRepository
  implements OccurrenceRepository
{
  public occurrences: Occurrence[] = []

  async findOpenRecent(
    params: FindOpenRecentParams,
  ): Promise<Occurrence | null> {
    const lowerBound = new Date(
      params.detectedAt.getTime() -
        params.windowInMinutes * 60 * 1000,
    )

    const matches = this.occurrences
      .filter((occurrence) => {
        return (
          occurrence.siteId === params.siteId &&
          occurrence.type === params.type &&
          occurrence.status === OccurrenceStatus.OPEN &&
          occurrence.detectedAt >= lowerBound &&
          occurrence.detectedAt <= params.detectedAt
        )
      })
      .sort(
        (a, b) =>
          b.detectedAt.getTime() -
          a.detectedAt.getTime(),
      )

    return matches[0] ?? null
  }

  async findAndIncrementOpenRecent(
    params: FindOpenRecentParams,
  ): Promise<Occurrence | null> {
    const occurrence =
      await this.findOpenRecent(params)

    if (!occurrence) {
      return null
    }

    occurrence.registerRepetition()

    return occurrence
  }

  async findAll(
    filters: FindAllOccurrencesFilters,
  ): Promise<Occurrence[]> {
    return this.occurrences.filter((occurrence) => {
      if (
        filters.status &&
        occurrence.status !== filters.status
      ) {
        return false
      }

      if (
        filters.siteId &&
        occurrence.siteId !== filters.siteId
      ) {
        return false
      }

      return true
    })
  }

  async findById(
    id: string,
  ): Promise<Occurrence | null> {
    return (
      this.occurrences.find(
        (occurrence) => occurrence.id === id,
      ) ?? null
    )
  }

  async create(
    occurrence: Occurrence,
  ): Promise<Occurrence> {
    this.occurrences.push(occurrence)
    return occurrence
  }

  async save(
    occurrence: Occurrence,
  ): Promise<Occurrence> {
    const index = this.occurrences.findIndex(
      (item) => item.id === occurrence.id,
    )

    if (index >= 0) {
      this.occurrences[index] = occurrence
    }

    return occurrence
  }
}

describe('RegisterOccurrence', () => {
  let repository: InMemoryOccurrenceRepository
  let registerOccurrence: RegisterOccurrence

  beforeEach(() => {
    repository = new InMemoryOccurrenceRepository()
    registerOccurrence = new RegisterOccurrence(repository)
  })

  it('should create a new occurrence when there is no recent open occurrence', async () => {
    const result = await registerOccurrence.execute({
      siteId: 'site-1',
      droneId: 'drone-1',
      type: OccurrenceType.INTRUSION,
      severity: 2,
      detectedAt: new Date('2026-09-29T10:00:00Z'),
    })

    expect(repository.occurrences).toHaveLength(1)
    expect(result.grouped).toBe(false)
    expect(result.occurrence.siteId).toBe('site-1')
    expect(result.occurrence.droneId).toBe('drone-1')
    expect(result.occurrence.type).toBe(
      OccurrenceType.INTRUSION,
    )
    expect(result.occurrence.severity).toBe(2)
    expect(result.occurrence.count).toBe(1)
    expect(result.occurrence.status).toBe(
      OccurrenceStatus.OPEN,
    )
  })

  it('should group an occurrence with the same site and type within 10 minutes', async () => {
    const firstResult =
      await registerOccurrence.execute({
        siteId: 'site-1',
        droneId: 'drone-1',
        type: OccurrenceType.INTRUSION,
        severity: 2,
        detectedAt: new Date(
          '2026-09-29T10:00:00Z',
        ),
      })

    const secondResult =
      await registerOccurrence.execute({
        siteId: 'site-1',
        droneId: 'drone-2',
        type: OccurrenceType.INTRUSION,
        severity: 4,
        detectedAt: new Date(
          '2026-09-29T10:05:00Z',
        ),
      })

    expect(repository.occurrences).toHaveLength(1)
    expect(firstResult.grouped).toBe(false)
    expect(secondResult.grouped).toBe(true)
    expect(secondResult.occurrence.id).toBe(
      firstResult.occurrence.id,
    )
    expect(secondResult.occurrence.count).toBe(2)
    expect(secondResult.occurrence.severity).toBe(3)
  })

  it('should not increase severity above 5 when grouping occurrences', async () => {
    repository.occurrences.push(
      Occurrence.create({
        siteId: 'site-1',
        droneId: 'drone-1',
        type: OccurrenceType.PERIMETER_BREACH,
        severity: 5,
        detectedAt: new Date(
          '2026-09-29T10:00:00Z',
        ),
      }),
    )

    const result = await registerOccurrence.execute({
      siteId: 'site-1',
      droneId: 'drone-2',
      type: OccurrenceType.PERIMETER_BREACH,
      severity: 3,
      detectedAt: new Date(
        '2026-09-29T10:05:00Z',
      ),
    })

    expect(result.grouped).toBe(true)
    expect(result.occurrence.severity).toBe(5)
    expect(result.occurrence.count).toBe(2)
  })

  it('should create a new occurrence when the previous one is outside the 10 minute window', async () => {
    repository.occurrences.push(
      Occurrence.create({
        siteId: 'site-1',
        droneId: 'drone-1',
        type: OccurrenceType.SIGNAL_LOSS,
        severity: 2,
        detectedAt: new Date(
          '2026-09-29T10:00:00Z',
        ),
      }),
    )

    const result = await registerOccurrence.execute({
      siteId: 'site-1',
      droneId: 'drone-2',
      type: OccurrenceType.SIGNAL_LOSS,
      severity: 3,
      detectedAt: new Date(
        '2026-09-29T10:11:00Z',
      ),
    })

    expect(result.grouped).toBe(false)
    expect(repository.occurrences).toHaveLength(2)
  })

  it('should create a new occurrence when the existing occurrence is not open', async () => {
    const occurrence = Occurrence.create({
      siteId: 'site-1',
      droneId: 'drone-1',
      type: OccurrenceType.LOW_BATTERY,
      severity: 2,
      detectedAt: new Date(
        '2026-09-29T10:00:00Z',
      ),
    })

    occurrence.acknowledge()

    repository.occurrences.push(occurrence)

    const result = await registerOccurrence.execute({
      siteId: 'site-1',
      droneId: 'drone-2',
      type: OccurrenceType.LOW_BATTERY,
      severity: 3,
      detectedAt: new Date(
        '2026-09-29T10:05:00Z',
      ),
    })

    expect(result.grouped).toBe(false)
    expect(repository.occurrences).toHaveLength(2)
  })
})
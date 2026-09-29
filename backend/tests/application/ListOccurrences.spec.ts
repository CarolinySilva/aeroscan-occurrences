import {
    beforeEach,
    describe,
    expect,
    it,
  } from '@jest/globals'
  
  import { ListOccurrences } from '../../src/application/use-cases/ListOccurrences'
  import {
    FindAllOccurrencesFilters,
    FindOpenRecentParams,
    OccurrenceRepository,
  } from '../../src/application/ports/OccurrenceRepository'
  import { Occurrence } from '../../src/domain/entities/Occurrence'
  import { OccurrenceStatus } from '../../src/domain/enums/OccurrenceStatus'
  import { OccurrenceType } from '../../src/domain/enums/OccurrenceType'

class InMemoryOccurrenceRepository implements OccurrenceRepository {
  public occurrences: Occurrence[] = []

  async findOpenRecent(
    _params: FindOpenRecentParams,
  ): Promise<Occurrence | null> {
    return null
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

describe('ListOccurrences', () => {
  let repository: InMemoryOccurrenceRepository
  let listOccurrences: ListOccurrences

  beforeEach(() => {
    repository = new InMemoryOccurrenceRepository()
    listOccurrences = new ListOccurrences(repository)
  })

  it('should list all occurrences', async () => {
    repository.occurrences = [
      Occurrence.create({
        siteId: 'site-1',
        droneId: 'drone-1',
        type: OccurrenceType.INTRUSION,
        severity: 3,
        detectedAt: new Date('2026-09-29T10:00:00Z'),
      }),
      Occurrence.create({
        siteId: 'site-2',
        droneId: 'drone-2',
        type: OccurrenceType.LOW_BATTERY,
        severity: 2,
        detectedAt: new Date('2026-09-29T11:00:00Z'),
      }),
    ]

    const result = await listOccurrences.execute({})

    expect(result).toHaveLength(2)
  })

  it('should filter occurrences by status', async () => {
    repository.occurrences = [
      Occurrence.create({
        siteId: 'site-1',
        droneId: 'drone-1',
        type: OccurrenceType.INTRUSION,
        severity: 3,
        detectedAt: new Date(),
        status: OccurrenceStatus.OPEN,
      }),
      Occurrence.create({
        siteId: 'site-2',
        droneId: 'drone-2',
        type: OccurrenceType.LOW_BATTERY,
        severity: 2,
        detectedAt: new Date(),
        status: OccurrenceStatus.ACKNOWLEDGED,
      }),
    ]

    const result = await listOccurrences.execute({
      status: OccurrenceStatus.OPEN,
    })

    expect(result).toHaveLength(1)
    expect(result[0]?.status).toBe(
      OccurrenceStatus.OPEN,
    )
  })

  it('should filter occurrences by siteId', async () => {
    repository.occurrences = [
      Occurrence.create({
        siteId: 'site-1',
        droneId: 'drone-1',
        type: OccurrenceType.INTRUSION,
        severity: 3,
        detectedAt: new Date(),
      }),
      Occurrence.create({
        siteId: 'site-2',
        droneId: 'drone-2',
        type: OccurrenceType.SIGNAL_LOSS,
        severity: 2,
        detectedAt: new Date(),
      }),
    ]

    const result = await listOccurrences.execute({
      siteId: 'site-1',
    })

    expect(result).toHaveLength(1)
    expect(result[0]?.siteId).toBe('site-1')
  })

  it('should sort by priority and then by most recent detectedAt', async () => {
    repository.occurrences = [
      Occurrence.create({
        siteId: 'site-1',
        droneId: 'drone-1',
        type: OccurrenceType.LOW_BATTERY,
        severity: 5,
        detectedAt: new Date('2026-09-29T12:00:00Z'),
      }),
      Occurrence.create({
        siteId: 'site-2',
        droneId: 'drone-2',
        type: OccurrenceType.INTRUSION,
        severity: 2,
        detectedAt: new Date('2026-09-29T10:00:00Z'),
      }),
      Occurrence.create({
        siteId: 'site-3',
        droneId: 'drone-3',
        type: OccurrenceType.PERIMETER_BREACH,
        severity: 3,
        detectedAt: new Date('2026-09-29T11:00:00Z'),
      }),
    ]

    const result = await listOccurrences.execute({})

    expect(result[0]?.priority).toBe(6)
    expect(result[0]?.siteId).toBe('site-3')

    expect(result[1]?.priority).toBe(6)
    expect(result[1]?.siteId).toBe('site-2')

    expect(result[2]?.priority).toBe(5)
    expect(result[2]?.siteId).toBe('site-1')
  })
})
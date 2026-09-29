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
  import { ChangeOccurrenceStatus } from '../../src/application/use-cases/ChangeOccurrenceStatus'
  import { Occurrence } from '../../src/domain/entities/Occurrence'
  import { OccurrenceStatus } from '../../src/domain/enums/OccurrenceStatus'
  import { OccurrenceType } from '../../src/domain/enums/OccurrenceType'
  
  class InMemoryOccurrenceRepository
    implements OccurrenceRepository
  {
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
  
  describe('ChangeOccurrenceStatus', () => {
    let repository: InMemoryOccurrenceRepository
    let changeOccurrenceStatus: ChangeOccurrenceStatus
  
    beforeEach(() => {
      repository = new InMemoryOccurrenceRepository()
  
      changeOccurrenceStatus =
        new ChangeOccurrenceStatus(repository)
    })
  
    it('should acknowledge an open occurrence', async () => {
      const occurrence = Occurrence.create({
        siteId: 'site-1',
        droneId: 'drone-1',
        type: OccurrenceType.INTRUSION,
        severity: 3,
        detectedAt: new Date(),
      })
  
      repository.occurrences.push(occurrence)
  
      const result =
        await changeOccurrenceStatus.execute({
          id: occurrence.id,
          status: OccurrenceStatus.ACKNOWLEDGED,
        })
  
      expect(result.status).toBe(
        OccurrenceStatus.ACKNOWLEDGED,
      )
    })
  
    it('should resolve an acknowledged occurrence with a note', async () => {
      const occurrence = Occurrence.create({
        siteId: 'site-1',
        droneId: 'drone-1',
        type: OccurrenceType.INTRUSION,
        severity: 3,
        detectedAt: new Date(),
      })
  
      occurrence.acknowledge()
  
      repository.occurrences.push(occurrence)
  
      const result =
        await changeOccurrenceStatus.execute({
          id: occurrence.id,
          status: OccurrenceStatus.RESOLVED,
          note: 'Occurrence verified by the team',
        })
  
      expect(result.status).toBe(
        OccurrenceStatus.RESOLVED,
      )
  
      expect(result.note).toBe(
        'Occurrence verified by the team',
      )
    })
  
    it('should reject resolving an open occurrence', async () => {
      const occurrence = Occurrence.create({
        siteId: 'site-1',
        droneId: 'drone-1',
        type: OccurrenceType.INTRUSION,
        severity: 3,
        detectedAt: new Date(),
      })
  
      repository.occurrences.push(occurrence)
  
      await expect(
        changeOccurrenceStatus.execute({
          id: occurrence.id,
          status: OccurrenceStatus.RESOLVED,
          note: 'Trying to resolve directly',
        }),
      ).rejects.toThrow()
    })
  
    it('should reject resolving without a note', async () => {
      const occurrence = Occurrence.create({
        siteId: 'site-1',
        droneId: 'drone-1',
        type: OccurrenceType.INTRUSION,
        severity: 3,
        detectedAt: new Date(),
      })
  
      occurrence.acknowledge()
  
      repository.occurrences.push(occurrence)
  
      await expect(
        changeOccurrenceStatus.execute({
          id: occurrence.id,
          status: OccurrenceStatus.RESOLVED,
        }),
      ).rejects.toThrow()
    })
  
    it('should reject acknowledging an already acknowledged occurrence', async () => {
      const occurrence = Occurrence.create({
        siteId: 'site-1',
        droneId: 'drone-1',
        type: OccurrenceType.INTRUSION,
        severity: 3,
        detectedAt: new Date(),
      })
  
      occurrence.acknowledge()
  
      repository.occurrences.push(occurrence)
  
      await expect(
        changeOccurrenceStatus.execute({
          id: occurrence.id,
          status: OccurrenceStatus.ACKNOWLEDGED,
        }),
      ).rejects.toThrow()
    })
  
    it('should throw when occurrence does not exist', async () => {
      await expect(
        changeOccurrenceStatus.execute({
          id: 'non-existent-id',
          status: OccurrenceStatus.ACKNOWLEDGED,
        }),
      ).rejects.toThrow('Occurrence not found')
    })
  })
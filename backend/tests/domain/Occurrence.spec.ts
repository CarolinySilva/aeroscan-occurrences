import { describe, expect, it } from '@jest/globals'

import { Occurrence } from '../../src/domain/entities/Occurrence'
import { OccurrenceStatus } from '../../src/domain/enums/OccurrenceStatus'
import { OccurrenceType } from '../../src/domain/enums/OccurrenceType'
import { DomainError } from '../../src/domain/errors/DomainError'


function makeOccurrence(severity = 3) {
  return Occurrence.create({
    siteId: 'site-01',
    droneId: 'drone-01',
    type: OccurrenceType.INTRUSION,
    severity,
    detectedAt: new Date('2026-09-29T15:00:00.000Z'),
  })
}

describe('Occurrence', () => {
  it('should create an occurrence with default values', () => {
    const occurrence = makeOccurrence()

    expect(occurrence.count).toBe(1)
    expect(occurrence.status).toBe(OccurrenceStatus.OPEN)
  })

  it('should reject severity lower than 1', () => {
    expect(() => makeOccurrence(0)).toThrow(DomainError)
  })

  it('should reject severity greater than 5', () => {
    expect(() => makeOccurrence(6)).toThrow(DomainError)
  })

  it('should increment count and severity when repeated', () => {
    const occurrence = makeOccurrence(3)

    occurrence.registerRepetition()

    expect(occurrence.count).toBe(2)
    expect(occurrence.severity).toBe(4)
  })

  it('should not increase severity above 5', () => {
    const occurrence = makeOccurrence(5)

    occurrence.registerRepetition()

    expect(occurrence.count).toBe(2)
    expect(occurrence.severity).toBe(5)
  })

  it('should acknowledge an open occurrence', () => {
    const occurrence = makeOccurrence()

    occurrence.acknowledge()

    expect(occurrence.status).toBe(
      OccurrenceStatus.ACKNOWLEDGED,
    )
  })

  it('should resolve an acknowledged occurrence with a note', () => {
    const occurrence = makeOccurrence()

    occurrence.acknowledge()
    occurrence.resolve('Area checked by security team')

    expect(occurrence.status).toBe(
      OccurrenceStatus.RESOLVED,
    )

    expect(occurrence.note).toBe(
      'Area checked by security team',
    )
  })

  it('should require a note when resolving', () => {
    const occurrence = makeOccurrence()

    occurrence.acknowledge()

    expect(() => occurrence.resolve('')).toThrow(
      DomainError,
    )
  })

  it('should not resolve an open occurrence directly', () => {
    const occurrence = makeOccurrence()

    expect(() =>
      occurrence.resolve('Area checked'),
    ).toThrow(DomainError)
  })
})
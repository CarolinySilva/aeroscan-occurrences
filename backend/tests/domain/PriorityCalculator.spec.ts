import { describe, expect, it } from '@jest/globals'
import { PriorityCalculator } from '../../src/domain/services/PriorityCalculator'
import { OccurrenceType } from '../../src/domain/enums/OccurrenceType'

describe('PriorityCalculator', () => {
  it('calculates intrusion priority', () => {
    expect(
      PriorityCalculator.calculate(
        OccurrenceType.INTRUSION,
        3,
      ),
    ).toBe(9)
  })

  it('calculates perimeter breach priority', () => {
    expect(
      PriorityCalculator.calculate(
        OccurrenceType.PERIMETER_BREACH,
        4,
      ),
    ).toBe(8)
  })

  it('calculates low battery priority', () => {
    expect(
      PriorityCalculator.calculate(
        OccurrenceType.LOW_BATTERY,
        5,
      ),
    ).toBe(5)
  })
})
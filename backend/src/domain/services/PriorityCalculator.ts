import { OccurrenceType } from '../enums/OccurrenceType'

const TYPE_WEIGHTS: Record<OccurrenceType, number> = {
  [OccurrenceType.INTRUSION]: 3,
  [OccurrenceType.PERIMETER_BREACH]: 2,
  [OccurrenceType.LOW_BATTERY]: 1,
  [OccurrenceType.SIGNAL_LOSS]: 1,
}

export class PriorityCalculator {
  static calculate(
    type: OccurrenceType,
    severity: number,
  ): number {
    return severity * TYPE_WEIGHTS[type]
  }
}
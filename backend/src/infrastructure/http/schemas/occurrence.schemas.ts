import { z } from 'zod'

import { OccurrenceStatus } from '../../../domain/enums/OccurrenceStatus'
import { OccurrenceType } from '../../../domain/enums/OccurrenceType'

export const registerOccurrenceSchema = z.object({
  siteId: z.string().trim().min(1),
  droneId: z.string().trim().min(1),
  type: z.nativeEnum(OccurrenceType),
  severity: z.number().int().min(1).max(5),
  detectedAt: z.string().datetime(),
})

export const listOccurrencesQuerySchema = z.object({
  status: z.nativeEnum(OccurrenceStatus).optional(),
  siteId: z.string().trim().min(1).optional(),
})

export const changeOccurrenceStatusSchema = z.object({
  status: z.nativeEnum(OccurrenceStatus),
  note: z.string().trim().min(1).optional(),
})
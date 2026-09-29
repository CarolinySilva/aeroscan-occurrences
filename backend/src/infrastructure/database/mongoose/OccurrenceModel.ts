import { Schema, model } from 'mongoose'

import { OccurrenceStatus } from '../../../domain/enums/OccurrenceStatus'
import { OccurrenceType } from '../../../domain/enums/OccurrenceType'

export interface OccurrenceDocument {
  _id: string
  siteId: string
  droneId: string
  type: OccurrenceType
  severity: number
  detectedAt: Date
  status: OccurrenceStatus
  count: number
  note?: string
}

const occurrenceSchema = new Schema<OccurrenceDocument>(
  {
    _id: {
      type: String,
      required: true,
    },

    siteId: {
      type: String,
      required: true,
    },

    droneId: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: Object.values(OccurrenceType),
      required: true,
    },

    severity: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    detectedAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(OccurrenceStatus),
      default: OccurrenceStatus.OPEN,
      required: true,
    },

    count: {
      type: Number,
      default: 1,
      required: true,
    },

    note: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
)

occurrenceSchema.index({
  siteId: 1,
  type: 1,
  status: 1,
  detectedAt: -1,
})

export const OccurrenceModel = model<OccurrenceDocument>(
  'Occurrence',
  occurrenceSchema,
)
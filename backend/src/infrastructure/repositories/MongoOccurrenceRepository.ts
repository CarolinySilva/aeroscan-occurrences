import {
    FindOpenRecentParams,
    OccurrenceRepository,
  } from '../../application/ports/OccurrenceRepository'
  
  import { Occurrence } from '../../domain/entities/Occurrence'
  import { OccurrenceStatus } from '../../domain/enums/OccurrenceStatus'
  import { OccurrenceModel } from '../database/mongoose/OccurrenceModel'
  
  export class MongoOccurrenceRepository
    implements OccurrenceRepository
  {
    async findOpenRecent(
      params: FindOpenRecentParams,
    ): Promise<Occurrence | null> {
      const lowerBound = new Date(
        params.detectedAt.getTime() -
          params.windowInMinutes * 60 * 1000,
      )
  
      const document = await OccurrenceModel.findOne({
        siteId: params.siteId,
        type: params.type,
        status: OccurrenceStatus.OPEN,
        detectedAt: {
          $gte: lowerBound,
          $lte: params.detectedAt,
        },
      })
        .sort({ detectedAt: -1 })
        .lean()
  
      if (!document) {
        return null
      }
  
      return Occurrence.create({
        id: document._id,
        siteId: document.siteId,
        droneId: document.droneId,
        type: document.type,
        severity: document.severity,
        detectedAt: document.detectedAt,
        status: document.status,
        count: document.count,
        ...(document.note !== undefined
          ? { note: document.note }
          : {}),
      })
    }
  
    async create(
      occurrence: Occurrence,
    ): Promise<Occurrence> {
      await OccurrenceModel.create({
        _id: occurrence.id,
        siteId: occurrence.siteId,
        droneId: occurrence.droneId,
        type: occurrence.type,
        severity: occurrence.severity,
        detectedAt: occurrence.detectedAt,
        status: occurrence.status,
        count: occurrence.count,
        ...(occurrence.note !== undefined
          ? { note: occurrence.note }
          : {}),
      })
  
      return occurrence
    }
  
    async save(
      occurrence: Occurrence,
    ): Promise<Occurrence> {
      const update: Record<string, unknown> = {
        severity: occurrence.severity,
        status: occurrence.status,
        count: occurrence.count,
      }
  
      if (occurrence.note !== undefined) {
        update.note = occurrence.note
      }
  
      await OccurrenceModel.updateOne(
        {
          _id: occurrence.id,
        },
        {
          $set: update,
        },
      )
  
      return occurrence
    }
}
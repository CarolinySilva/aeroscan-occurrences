import { Request, Response } from 'express'

import { RegisterOccurrence } from '../../../application/use-cases/RegisterOccurrence'
import { OccurrenceType } from '../../../domain/enums/OccurrenceType'
import { MongoOccurrenceRepository } from '../../repositories/MongoOccurrenceRepository'

const occurrenceRepository = new MongoOccurrenceRepository()
const registerOccurrence = new RegisterOccurrence(occurrenceRepository)

export class RegisterOccurrenceController {
  async handle(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const {
      siteId,
      droneId,
      type,
      severity,
      detectedAt,
    } = request.body

    const result = await registerOccurrence.execute({
      siteId,
      droneId,
      type: type as OccurrenceType,
      severity,
      detectedAt: new Date(detectedAt),
    })

    return response.status(
      result.grouped ? 200 : 201,
    ).json({
      grouped: result.grouped,
      occurrence: {
        id: result.occurrence.id,
        siteId: result.occurrence.siteId,
        droneId: result.occurrence.droneId,
        type: result.occurrence.type,
        severity: result.occurrence.severity,
        detectedAt: result.occurrence.detectedAt,
        status: result.occurrence.status,
        count: result.occurrence.count,
        note: result.occurrence.note,
      },
    })
  }
}
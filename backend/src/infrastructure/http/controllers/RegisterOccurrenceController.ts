import { Request, Response } from 'express'

import { RegisterOccurrence } from '../../../application/use-cases/RegisterOccurrence'
import { MongoOccurrenceRepository } from '../../repositories/MongoOccurrenceRepository'
import { registerOccurrenceSchema } from '../schemas/occurrence.schemas'

const occurrenceRepository =
  new MongoOccurrenceRepository()

const registerOccurrence =
  new RegisterOccurrence(occurrenceRepository)

export class RegisterOccurrenceController {
  async handle(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const data =
      registerOccurrenceSchema.parse(request.body)

    const result =
      await registerOccurrence.execute({
        siteId: data.siteId,
        droneId: data.droneId,
        type: data.type,
        severity: data.severity,
        detectedAt: new Date(data.detectedAt),
      })

    return response
      .status(result.grouped ? 200 : 201)
      .json({
        grouped: result.grouped,
        occurrence: {
          id: result.occurrence.id,
          siteId: result.occurrence.siteId,
          droneId: result.occurrence.droneId,
          type: result.occurrence.type,
          severity: result.occurrence.severity,
          detectedAt:
            result.occurrence.detectedAt,
          status: result.occurrence.status,
          count: result.occurrence.count,
          note: result.occurrence.note,
        },
      })
  }
}
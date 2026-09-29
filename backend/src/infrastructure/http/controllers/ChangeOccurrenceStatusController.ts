import { Request, Response } from 'express'

import { ChangeOccurrenceStatus } from '../../../application/use-cases/ChangeOccurrenceStatus'
import { MongoOccurrenceRepository } from '../../repositories/MongoOccurrenceRepository'
import { changeOccurrenceStatusSchema } from '../schemas/occurrence.schemas'

const occurrenceRepository =
  new MongoOccurrenceRepository()

const changeOccurrenceStatus =
  new ChangeOccurrenceStatus(
    occurrenceRepository,
  )

export class ChangeOccurrenceStatusController {
  async handle(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const id = String(request.params.id)

    const data =
      changeOccurrenceStatusSchema.parse(
        request.body,
      )

    const occurrence =
      await changeOccurrenceStatus.execute({
        id,
        status: data.status,
        ...(data.note !== undefined
          ? { note: data.note }
          : {}),
      })

    return response.status(200).json({
      id: occurrence.id,
      siteId: occurrence.siteId,
      droneId: occurrence.droneId,
      type: occurrence.type,
      severity: occurrence.severity,
      detectedAt: occurrence.detectedAt,
      status: occurrence.status,
      count: occurrence.count,
      note: occurrence.note,
    })
  }
}
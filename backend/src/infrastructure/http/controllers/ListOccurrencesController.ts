import { Request, Response } from 'express'

import { ListOccurrences } from '../../../application/use-cases/ListOccurrences'
import { OccurrenceStatus } from '../../../domain/enums/OccurrenceStatus'
import { MongoOccurrenceRepository } from '../../repositories/MongoOccurrenceRepository'

const occurrenceRepository = new MongoOccurrenceRepository()
const listOccurrences = new ListOccurrences(occurrenceRepository)

export class ListOccurrencesController {
  async handle(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { status, siteId } = request.query

    const result = await listOccurrences.execute({
      ...(status
        ? { status: status as OccurrenceStatus }
        : {}),
      ...(siteId
        ? { siteId: String(siteId) }
        : {}),
    })

    return response.status(200).json(result)
  }
}
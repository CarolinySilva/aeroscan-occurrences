import { Request, Response } from 'express'

import { FindAllOccurrencesFilters } from '../../../application/ports/OccurrenceRepository'
import { ListOccurrences } from '../../../application/use-cases/ListOccurrences'
import { MongoOccurrenceRepository } from '../../repositories/MongoOccurrenceRepository'
import { listOccurrencesQuerySchema } from '../schemas/occurrence.schemas'

const occurrenceRepository =
  new MongoOccurrenceRepository()

const listOccurrences =
  new ListOccurrences(occurrenceRepository)

export class ListOccurrencesController {
  async handle(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const data =
      listOccurrencesQuerySchema.parse(
        request.query,
      )

    const filters: FindAllOccurrencesFilters = {
      ...(data.status !== undefined
        ? { status: data.status }
        : {}),
      ...(data.siteId !== undefined
        ? { siteId: data.siteId }
        : {}),
    }

    const result =
      await listOccurrences.execute(filters)

    return response.status(200).json(result)
  }
}
import {
    NextFunction,
    Request,
    Response,
    Router,
  } from 'express'
  
  import { ChangeOccurrenceStatusController } from '../controllers/ChangeOccurrenceStatusController'
  import { ListOccurrencesController } from '../controllers/ListOccurrencesController'
  import { RegisterOccurrenceController } from '../controllers/RegisterOccurrenceController'
  
  export const occurrenceRoutes = Router()
  
  const registerOccurrenceController =
    new RegisterOccurrenceController()
  
  const listOccurrencesController =
    new ListOccurrencesController()
  
  const changeOccurrenceStatusController =
    new ChangeOccurrenceStatusController()
  
  function asyncHandler(
    handler: (
      request: Request,
      response: Response,
    ) => Promise<Response>,
  ) {
    return (
      request: Request,
      response: Response,
      next: NextFunction,
    ): void => {
      handler(request, response).catch(next)
    }
  }
  
  occurrenceRoutes.post(
    '/occurrences',
    asyncHandler((request, response) =>
      registerOccurrenceController.handle(
        request,
        response,
      ),
    ),
  )
  
  occurrenceRoutes.get(
    '/occurrences',
    asyncHandler((request, response) =>
      listOccurrencesController.handle(
        request,
        response,
      ),
    ),
  )
  
  occurrenceRoutes.patch(
    '/occurrences/:id/status',
    asyncHandler((request, response) =>
      changeOccurrenceStatusController.handle(
        request,
        response,
      ),
    ),
  )
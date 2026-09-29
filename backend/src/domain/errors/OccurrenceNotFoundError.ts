export class OccurrenceNotFoundError extends Error {
    constructor() {
      super('Occurrence not found')
      this.name = 'OccurrenceNotFoundError'
    }
  }
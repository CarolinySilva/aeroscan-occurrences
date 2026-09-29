import {
    describe,
    expect,
    it,
  } from '@jest/globals'
  
  import request from 'supertest'
  
  import { app } from '../../src/app'
  
  describe('Occurrence HTTP API', () => {
    it('should return health check', async () => {
      const response = await request(app)
        .get('/health')
  
      expect(response.status).toBe(200)
  
      expect(response.body).toEqual({
        status: 'ok',
      })
    })
  
    it('should reject invalid occurrence payload', async () => {
      const response = await request(app)
        .post('/occurrences')
        .send({
          siteId: '',
          droneId: 'drone-01',
          type: 'banana',
          severity: 99,
          detectedAt: 'invalid-date',
        })
  
      expect(response.status).toBe(400)
  
      expect(response.body.message).toBe(
        'Invalid request data',
      )
  
      expect(response.body.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'siteId',
          }),
          expect.objectContaining({
            field: 'type',
          }),
          expect.objectContaining({
            field: 'severity',
          }),
          expect.objectContaining({
            field: 'detectedAt',
          }),
        ]),
      )
    })
  })
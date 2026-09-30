import assert from 'node:assert/strict'
import mongoose from 'mongoose'

import { Occurrence } from '../../src/domain/entities/Occurrence'
import { OccurrenceStatus } from '../../src/domain/enums/OccurrenceStatus'
import { OccurrenceType } from '../../src/domain/enums/OccurrenceType'
import { OccurrenceModel } from '../../src/infrastructure/database/mongoose/OccurrenceModel'
import { MongoOccurrenceRepository } from '../../src/infrastructure/repositories/MongoOccurrenceRepository'

const repository = new MongoOccurrenceRepository()

async function cleanDatabase(): Promise<void> {
  await OccurrenceModel.deleteMany({})
}

async function testCreateAndFindById(): Promise<void> {
  await cleanDatabase()

  const occurrence = Occurrence.create({
    siteId: 'site-01',
    droneId: 'drone-01',
    type: OccurrenceType.INTRUSION,
    severity: 2,
    detectedAt: new Date('2026-09-30T10:00:00.000Z'),
  })

  await repository.create(occurrence)

  const found = await repository.findById(
    occurrence.id,
  )

  assert.ok(found)
  assert.equal(found.id, occurrence.id)
  assert.equal(found.siteId, 'site-01')
  assert.equal(found.count, 1)
  assert.equal(found.status, OccurrenceStatus.OPEN)

  console.log('✓ create and find by id')
}

async function testFindOpenRecent(): Promise<void> {
  await cleanDatabase()

  const occurrence = Occurrence.create({
    siteId: 'site-recent',
    droneId: 'drone-01',
    type: OccurrenceType.PERIMETER_BREACH,
    severity: 2,
    detectedAt: new Date(
      '2026-09-30T10:00:00.000Z',
    ),
  })

  await repository.create(occurrence)

  const found = await repository.findOpenRecent({
    siteId: 'site-recent',
    type: OccurrenceType.PERIMETER_BREACH,
    detectedAt: new Date(
      '2026-09-30T10:05:00.000Z',
    ),
    windowInMinutes: 10,
  })

  assert.ok(found)
  assert.equal(found.id, occurrence.id)

  console.log('✓ find recent open occurrence')
}

async function testFilters(): Promise<void> {
  await cleanDatabase()

  const openOccurrence = Occurrence.create({
    siteId: 'site-filter',
    droneId: 'drone-01',
    type: OccurrenceType.LOW_BATTERY,
    severity: 2,
    detectedAt: new Date(
      '2026-09-30T10:00:00.000Z',
    ),
  })

  const acknowledgedOccurrence =
    Occurrence.create({
      siteId: 'site-filter',
      droneId: 'drone-02',
      type: OccurrenceType.SIGNAL_LOSS,
      severity: 3,
      detectedAt: new Date(
        '2026-09-30T10:05:00.000Z',
      ),
    })

  acknowledgedOccurrence.acknowledge()

  await repository.create(openOccurrence)
  await repository.create(
    acknowledgedOccurrence,
  )

  const occurrences =
    await repository.findAll({
      siteId: 'site-filter',
      status: OccurrenceStatus.ACKNOWLEDGED,
    })

  assert.equal(occurrences.length, 1)
  assert.equal(
    occurrences[0]?.id,
    acknowledgedOccurrence.id,
  )

  console.log('✓ filter by siteId and status')
}

async function testAtomicIncrement(): Promise<void> {
  await cleanDatabase()

  const occurrence = Occurrence.create({
    siteId: 'atomic-integration-site',
    droneId: 'drone-01',
    type: OccurrenceType.INTRUSION,
    severity: 1,
    detectedAt: new Date(
      '2026-09-30T10:00:00.000Z',
    ),
  })

  await repository.create(occurrence)

  const params = {
    siteId: 'atomic-integration-site',
    type: OccurrenceType.INTRUSION,
    detectedAt: new Date(
      '2026-09-30T10:05:00.000Z',
    ),
    windowInMinutes: 10,
  }

  await Promise.all(
    Array.from({ length: 10 }, () =>
      repository.findAndIncrementOpenRecent(
        params,
      ),
    ),
  )

  const updated = await repository.findById(
    occurrence.id,
  )

  assert.ok(updated)
  assert.equal(updated.count, 11)
  assert.equal(updated.severity, 5)

  console.log(
    '✓ atomic concurrent increment',
  )
}

async function run(): Promise<void> {
  try {
    await mongoose.connect(
      'mongodb://127.0.0.1:27017/aeroscan_test',
    )

    console.log('MongoDB test database connected')

    await testCreateAndFindById()
    await testFindOpenRecent()
    await testFilters()
    await testAtomicIncrement()

    console.log('')
    console.log(
      '✓ All MongoDB integration tests passed',
    )
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase()
    }

    await mongoose.disconnect()
  }
}

run().catch((error) => {
  console.error(
    'MongoDB integration tests failed:',
    error,
  )
  process.exitCode = 1
})
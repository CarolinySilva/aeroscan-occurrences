import 'dotenv/config'

import { connectDatabase } from './infrastructure/database/mongoose/connection'

async function bootstrap(): Promise<void> {
  try {
    await connectDatabase()

    console.log('Application started successfully')
  } catch (error) {
    console.error('Failed to start application:', error)

    process.exit(1)
  }
}

void bootstrap()
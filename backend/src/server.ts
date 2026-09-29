import 'dotenv/config'

import { app } from './app'
import { connectDatabase } from './infrastructure/database/mongoose/connection'

async function bootstrap(): Promise<void> {
  try {
    await connectDatabase()

    const port = Number(process.env.PORT ?? 3000)

    app.listen(port, () => {
      console.log(`HTTP server running on port ${port}`)
    })
  } catch (error) {
    console.error('Failed to start application:', error)
    process.exit(1)
  }
}

void bootstrap()
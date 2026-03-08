import { getPayload } from 'payload'
import configPromise from './src/payload.config'

async function sync() {
  process.env.DATABASE_URL = process.env.DATABASE_URL_PROD;
  console.log('Syncing database: ', process.env.DATABASE_URL)
  const payload = await getPayload({ config: configPromise })
  console.log('Database schema successfully pushed.')
  process.exit(0)
}

sync()

import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 })
const db = drizzle(migrationClient)

export async function addIndexes() {
  try {
    await db.execute(sql`
      -- Add index for leads table
      CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
      CREATE INDEX IF NOT EXISTS idx_leads_phone_number ON leads(phone_number);
      
      -- Add index for call_analyses table
      CREATE INDEX IF NOT EXISTS idx_call_analyses_lead_id ON call_analyses(lead_id);
      CREATE INDEX IF NOT EXISTS idx_call_analyses_created_at ON call_analyses(created_at);
      
      -- Add composite index for appointments
      CREATE INDEX IF NOT EXISTS idx_appointments_lead_date ON appointments(lead_id, date);
    `)
  } finally {
    await migrationClient.end()
  }
}

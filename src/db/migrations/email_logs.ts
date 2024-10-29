import { sql } from 'drizzle-orm'
import { pgTable, uuid, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core'

export const emailLogs = pgTable('email_logs', {
  id: uuid('id').primaryKey(),
  lead_id: uuid('lead_id').references(() => 'leads.id').notNull(),
  to_emails: jsonb('to_emails').$type<string[]>().notNull(),
  from_email: text('from_email').notNull(),
  subject: text('subject').notNull(),
  html_content: text('html_content').notNull(),
  status: text('status').notNull(),
  delivery_status: text('delivery_status').default('pending').notNull(),
  opens: integer('opens').default(0).notNull(),
  clicks: integer('clicks').default(0).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  last_event: text('last_event')
})

// Add indexes for better query performance
export const emailLogsIndexes = sql`
  CREATE INDEX IF NOT EXISTS idx_email_logs_lead_id ON email_logs (lead_id);
  CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs (created_at);
`

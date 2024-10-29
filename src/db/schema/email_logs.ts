import { pgTable, uuid, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core'

export const emailLogs = pgTable('email_logs', {
  id: uuid('id').primaryKey(),
  lead_id: uuid('lead_id').references(() => leads.id).notNull(),
  to_emails: jsonb('to_emails').$type<string[]>().notNull(),
  from_email: text('from_email').notNull(),
  subject: text('subject').notNull(),
  html_content: text('html_content').notNull(),
  status: text('status').notNull(),
  delivery_status: text('delivery_status').notNull().default('pending'),
  opens: integer('opens').notNull().default(0),
  clicks: integer('clicks').notNull().default(0),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
  last_event: text('last_event'),
  metadata: jsonb('metadata').$type<Record<string, string>>()
})


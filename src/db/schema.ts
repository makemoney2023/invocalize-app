import { pgTable, uuid, text, timestamp, numeric, jsonb } from 'drizzle-orm/pg-core';

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone_number: text('phone_number').notNull(),
  company: text('company'),
  use_case: text('use_case'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at'),
  call_length: numeric('call_length'),
  price: numeric('price'),
  summary: text('summary'),
  concatenated_transcript: text('concatenated_transcript'),
});

export const callAnalyses = pgTable('call_analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  lead_id: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }).notNull(),
  sentiment_score: numeric('sentiment_score').notNull(),
  key_points: jsonb('key_points').$type<string[]>().notNull(),
  customer_satisfaction: text('customer_satisfaction').notNull(),
  appointment_details: text('appointment_details'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const emailLogs = pgTable('email_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  lead_id: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }).notNull(),
  to_emails: jsonb('to_emails').$type<string[]>().notNull(),
  from_email: text('from_email').notNull(),
  subject: text('subject').notNull(),
  html_content: text('html_content').notNull(),
  status: text('status').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});


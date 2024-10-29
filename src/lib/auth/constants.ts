export const CLERK_WEBHOOK_EVENTS = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  SESSION_CREATED: 'session.created',
  SESSION_ENDED: 'session.ended'
} as const;

export type ClerkWebhookEvent = typeof CLERK_WEBHOOK_EVENTS[keyof typeof CLERK_WEBHOOK_EVENTS]; 
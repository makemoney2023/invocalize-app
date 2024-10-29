import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabaseClient } from '@/lib/supabase/client';
import { ENV } from '@/lib/env';
import { z } from 'zod';
import { CLERK_WEBHOOK_EVENTS } from '@/lib/auth/constants';
import { userRoleSchema } from '@/lib/auth/types';

const webhookEventSchema = z.object({
  type: z.enum([
    CLERK_WEBHOOK_EVENTS.USER_CREATED,
    CLERK_WEBHOOK_EVENTS.USER_UPDATED,
    CLERK_WEBHOOK_EVENTS.USER_DELETED
  ] as const),
  data: z.object({
    id: z.string(),
    email_addresses: z.array(z.object({
      email_address: z.string().email()
    })),
    first_name: z.string().nullable(),
    last_name: z.string().nullable(),
    image_url: z.string().url().nullable(),
    public_metadata: z.object({
      role: userRoleSchema.optional()
    }).optional()
  })
});

export async function POST(req: Request) {
  try {
    const WEBHOOK_SECRET = ENV.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      throw new Error('Missing CLERK_WEBHOOK_SECRET');
    }

    const headersList = await headers();
    const svix_id = headersList.get("svix-id");
    const svix_timestamp = headersList.get("svix-timestamp");
    const svix_signature = headersList.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Missing svix headers', { status: 400 });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(WEBHOOK_SECRET);
    const evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;

    const validatedEvent = webhookEventSchema.safeParse(evt);

    if (!validatedEvent.success) {
      console.error('Invalid webhook event:', validatedEvent.error);
      return new Response('Invalid webhook event', { status: 400 });
    }

    const { data } = validatedEvent.data;
    
    const { error } = await supabaseClient
      .from('users')
      .upsert({
        clerk_id: data.id,
        email: data.email_addresses[0]?.email_address,
        first_name: data.first_name,
        last_name: data.last_name,
        image_url: data.image_url,
        role: data.public_metadata?.role ?? 'user',
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving user:', error);
      return new Response('Error saving user', { status: 500 });
    }

    return new Response('Success', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
}

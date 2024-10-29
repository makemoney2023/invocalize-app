import { createClerkClient } from "@clerk/clerk-sdk-node";
import { ENV } from "@/lib/env";
import { authConfigSchema, ROLES } from './types';

if (!ENV.CLERK_SECRET_KEY) {
  throw new Error("Missing CLERK_SECRET_KEY environment variable");
}

export const clerk = createClerkClient({
  secretKey: ENV.CLERK_SECRET_KEY,
});

export const CLERK_CONFIG = {
  appearance: {
    elements: {
      formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
      footerActionLink: "text-primary hover:text-primary/90",
      card: "border rounded-lg shadow-sm p-6",
      headerTitle: "text-2xl font-semibold",
      formFieldInput: "border rounded-md px-3 py-2",
      dividerLine: "bg-muted",
      dividerText: "text-muted-foreground"
    }
  }
} as const;

export const AUTH_CONFIG = {
  routes: {
    signIn: '/login',
    signUp: '/signup',
    afterSignIn: '/dashboard',
    afterSignUp: '/dashboard',
    afterSignOut: '/login'
  },
  publicRoutes: [
    '/',
    '/login',
    '/signup',
    '/signup/sso-callback',
    '/api/webhooks/(.*)',
    '/api/public/(.*)',
  ]
} as const;

export type AuthConfig = typeof AUTH_CONFIG;

export const PUBLIC_ROUTES = ['/sign-in', '/sign-up'];

export const DEFAULT_REDIRECT = '/';

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ['*'],
  [ROLES.USER]: ['/dashboard', '/profile', '/settings']
} as const;

import { z } from 'zod';

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export const userRoleSchema = z.enum([ROLES.ADMIN, ROLES.USER]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  imageUrl: z.string().url().nullable(),
  role: userRoleSchema,
  createdAt: z.date(),
  updatedAt: z.date()
});

export type AuthUser = z.infer<typeof authUserSchema>;

export const authConfigSchema = z.object({
  publicRoutes: z.array(z.string()),
  adminRoutes: z.array(z.string()),
  afterAuthRedirect: z.string(),
  afterSignOutRedirect: z.string(),
  signInUrl: z.string(),
  signUpUrl: z.string()
});

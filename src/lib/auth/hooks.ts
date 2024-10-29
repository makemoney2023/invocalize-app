import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";
import { useCallback } from "react";
import { type UserRole } from "./types";
import { ROLES } from "./config";
import { userRoleSchema } from "./types";

export function useAuth() {
  const { userId, sessionId, signOut, isLoaded } = useClerkAuth();
  
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }, [signOut]);

  return {
    isAuthenticated: !!userId,
    isLoaded,
    userId,
    sessionId,
    signOut: handleSignOut
  };
}

export function useUserRole(): UserRole {
  const { user } = useUser();
  const roleResult = userRoleSchema.safeParse(user?.publicMetadata?.role);
  
  if (!roleResult.success) {
    console.warn('Invalid user role, defaulting to user');
    return ROLES.USER;
  }
  
  return roleResult.data;
}

export function useIsAdmin() {
  const role = useUserRole();
  return role === ROLES.ADMIN;
}

export function useRequireAuth() {
  const { isLoaded, userId } = useAuth();
  
  if (!isLoaded) {
    throw new Error('Auth not loaded');
  }
  
  if (!userId) {
    throw new Error('Not authenticated');
  }
  
  return userId;
}

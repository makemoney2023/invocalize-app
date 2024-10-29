import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { AuthError } from "./errors";
import { authUserSchema, type AuthUser, type UserRole, userRoleSchema } from "./types";
import { ROLES } from "./config";

export class AuthService {
  static async getCurrentUser(): Promise<AuthUser> {
    const authResult = await auth();
    const userId = authResult.userId;
    
    if (!userId) {
      throw AuthError.unauthorized();
    }

    try {
      const user = await clerkClient.users.getUser(userId);
      const roleResult = userRoleSchema.safeParse(user.publicMetadata.role);
      
      const userData = {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? '',
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        role: roleResult.success ? roleResult.data : ROLES.USER,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      };

      return authUserSchema.parse(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw AuthError.unauthorized('Failed to fetch user data');
    }
  }

  static async verifyRole(requiredRole: UserRole): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user.role === requiredRole;
  }

  static async updateUserRole(userId: string, role: UserRole): Promise<void> {
    if (!userId) {
      throw AuthError.invalidInput('User ID is required');
    }

    try {
      const validRole = userRoleSchema.parse(role);
      
      const user = await clerkClient.users.getUser(userId);
      
      if (!user) {
        throw AuthError.notFound('User not found');
      }

      await clerkClient.users.updateUser(userId, {
        publicMetadata: { role: validRole }
      });
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      console.error('Error updating user role:', error);
      throw AuthError.internal('Failed to update user role');
    }
  }
}

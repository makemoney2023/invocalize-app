import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AuthService } from "@/lib/auth/service";
import { AuthError } from "@/lib/auth/errors";
import type { UserRole } from "@/lib/auth/types";
import { Ratelimit } from "@upstash/ratelimit";
import type { RatelimitConfig } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

type RouteConfig = {
  requiredRole?: UserRole;
  rateLimit?: RatelimitConfig;
};

// Add type for session claims
type SessionClaims = {
  metadata?: {
    role?: UserRole;
  };
};

export function createProtectedRoute(
  handler: (req: NextRequest, userId: string) => Promise<Response> | Response,
  config?: RouteConfig
) {
  return async function (req: NextRequest) {
    try {
      const { userId, sessionClaims } = getAuth(req);
      
      if (!userId) {
        throw AuthError.unauthorized();
      }

      // Role check with type safety
      if (config?.requiredRole) {
        const claims = sessionClaims as SessionClaims;
        const userRole = claims?.metadata?.role;
        
        if (!userRole || userRole !== config.requiredRole) {
          throw AuthError.forbidden();
        }
      }

      // Rate limiting
      if (config?.rateLimit) {
        const identifier = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
        const limiter = new Ratelimit({
          ...config.rateLimit,
          redis: redis,
        });
        
        const { success } = await limiter.limit(identifier);
        
        if (!success) {
          return NextResponse.json(
            { error: "Too many requests" },
            { status: 429 }
          );
        }
      }

      return await handler(req, userId);
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        );
      }

      console.error('Protected route error:', error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  };
}


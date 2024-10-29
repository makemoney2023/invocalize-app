'use client';

import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { userRoleSchema } from "@/lib/auth/types";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
};

export function ProtectedRoute({ 
  children, 
  requireAuth = true,
  requireAdmin = false 
}: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (requireAuth && !isSignedIn) {
      toast.error("Please sign in to access this page");
      router.push("/sign-in");
      return;
    }

    if (requireAdmin) {
      const roleResult = userRoleSchema.safeParse(user?.publicMetadata?.role);
      if (!roleResult.success || roleResult.data !== "admin") {
        toast.error("You don't have permission to access this page");
        router.push("/");
        return;
      }
    }
  }, [isLoaded, isSignedIn, user, requireAuth, requireAdmin, router]);

  if (!isLoaded) {
    return <LoadingSpinner className="fixed inset-0 m-auto" />;
  }

  if (requireAuth && !isSignedIn) return null;

  return <>{children}</>;
}

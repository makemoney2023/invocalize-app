import { SignIn } from "@clerk/nextjs";
import { Shell } from "@/components/ui/shell";
import { type Theme } from "@clerk/types";
import { AUTH_CONFIG } from "@/lib/auth/config";

const clerkTheme: Theme = {
  elements: {
    formButtonPrimary: 
      "bg-primary text-primary-foreground hover:bg-primary/90",
    card: "shadow-none",
    footerAction: "text-muted-foreground hover:text-foreground",
  },
};

export function AuthLayout() {
  return (
    <Shell className="max-w-lg mx-auto mt-20">
      <div className="px-4">
        <SignIn 
          appearance={{
            elements: clerkTheme,
          }}
          redirectUrl={AUTH_CONFIG.routes.afterSignIn}
          signUpUrl={AUTH_CONFIG.routes.signUp}
        />
      </div>
    </Shell>
  );
}

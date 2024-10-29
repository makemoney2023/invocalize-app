import { SignIn } from "@clerk/nextjs";
import { Shell } from "@/components/ui/shell";
import { type Theme } from "@clerk/types";

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
          afterSignInUrl="/dashboard"
          signUpUrl="/signup"
        />
      </div>
    </Shell>
  );
}

import { SignIn } from "@clerk/nextjs"
import { AUTH_CONFIG } from "@/lib/auth/config"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
            footerActionLink: "text-primary hover:text-primary/90",
            card: "border rounded-lg shadow-sm p-6",
            headerTitle: "text-2xl font-semibold",
            formFieldInput: "border rounded-md px-3 py-2",
            dividerLine: "bg-muted",
            dividerText: "text-muted-foreground"
          }
        }}
        routing="path"
        path={AUTH_CONFIG.routes.signIn}
        afterSignInUrl={AUTH_CONFIG.routes.afterSignIn}
        signUpUrl={AUTH_CONFIG.routes.signUp}
      />
    </div>
  )
} 
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp 
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
        path="/sign-up"
        signInUrl="/login"
        afterSignUpUrl="/"
      />
    </div>
  );
}

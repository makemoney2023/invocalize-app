'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp 
        path="/signup" 
        routing="path" 
        signInUrl="/login" 
        redirectUrl="/"
        afterSignUpUrl="/"
      />
    </div>
  );
}

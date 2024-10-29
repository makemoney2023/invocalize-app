'use client';

import { SignUp } from '@clerk/nextjs';

export default function ContinueSignUp() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp
        path="/signup/continue"
        routing="path"
        signInUrl="/login"
      />
    </div>
  );
}

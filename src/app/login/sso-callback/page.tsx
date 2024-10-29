'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

export default function LoginSSOCallback() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect_url') || '/';

  return (
    <div className="flex items-center justify-center min-h-screen">
      <AuthenticateWithRedirectCallback redirectUrl={redirectUrl} />
    </div>
  );
}

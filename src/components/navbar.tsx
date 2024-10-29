'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { AuthNav } from '@/components/nav/auth-nav';

export function Navbar() {
  const { user } = useUser();

  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="flex items-center space-x-4 flex-1">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-75 transition-opacity">
            <Image src="/logo.png" alt="Invocalize Logo" width={40} height={40} />
            <span className="font-semibold text-xl">Invocalize</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <Link href="/profile" className="text-sm font-medium hover:text-primary">
              Profile
            </Link>
          )}
          <AuthNav />
        </div>
      </div>
    </nav>
  );
}

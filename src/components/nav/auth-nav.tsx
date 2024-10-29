import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';

export function AuthNav() {
  return (
    <div className="flex items-center gap-4">
      <SignedOut>
        <Link 
          href="/sign-in"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Sign In
        </Link>
      </SignedOut>
      <SignedIn>
        <UserButton 
          afterSignOutUrl="/sign-in"
          appearance={{
            elements: {
              avatarBox: "h-10 w-10",
              userButtonPopoverCard: "right-0"
            }
          }}
        />
      </SignedIn>
    </div>
  );
}

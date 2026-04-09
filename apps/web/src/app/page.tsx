import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">XyphyX App Template</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Next.js · Convex · Clerk · Tailwind v4 · shadcn/ui
        </p>
      </div>

      <div className="flex items-center gap-4">
        <SignedOut>
          <SignInButton mode="modal">
            <button
              type="button"
              className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90"
            >
              Sign in
            </button>
          </SignInButton>
          <Link
            href="/sign-up"
            className="rounded-lg border border-border px-6 py-3 font-medium transition hover:bg-accent"
          >
            Get started
          </Link>
        </SignedOut>

        <SignedIn>
          <Link
            href="/dashboard"
            className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90"
          >
            Go to dashboard
          </Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </main>
  );
}

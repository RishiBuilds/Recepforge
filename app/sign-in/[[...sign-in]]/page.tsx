import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-background to-primary-100 dark:from-primary-950 dark:via-background dark:to-primary-900 p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white mb-4 shadow-lg">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">RecepForge</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Sign in to your clinic dashboard
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              cardBox: "shadow-none",
              card: "bg-surface border border-surface-border rounded-2xl shadow-lg",
              headerTitle: "text-foreground",
              headerSubtitle: "text-[var(--text-secondary)]",
              formButtonPrimary:
                "bg-primary-600 hover:bg-primary-700 text-white rounded-xl",
              footerActionLink: "text-primary-600 hover:text-primary-700",
              formFieldInput:
                "rounded-xl border-[var(--input-border)] bg-[var(--input-bg)] text-foreground",
            },
          }}
        />
      </div>
    </div>
  );
}

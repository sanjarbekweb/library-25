import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas-warm">
      <SignIn fallbackRedirectUrl="/catalog" forceRedirectUrl="/catalog" />
    </div>
  );
}

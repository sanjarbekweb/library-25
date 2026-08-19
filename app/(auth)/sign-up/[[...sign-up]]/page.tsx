import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas-warm">
      <SignUp fallbackRedirectUrl="/catalog" forceRedirectUrl="/catalog" />
    </div>
  );
}

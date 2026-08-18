import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AssistantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const role = sessionClaims?.metadata?.role;

  if (role !== "ASSISTANT" && role !== "ADMIN") {
    redirect("/");
  }

  return <>{children}</>;
}

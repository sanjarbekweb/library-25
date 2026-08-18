import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const role = sessionClaims?.metadata?.role;

  if (role !== "ADMIN") {
    redirect("/");
  }

  return <>{children}</>;
}

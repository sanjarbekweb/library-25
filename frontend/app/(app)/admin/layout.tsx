import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId } from "@/lib/services/user-service";
import { AppShellLayout } from "@/components/shared/app-shell-layout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  let role = sessionClaims?.metadata?.role;

  if (!role) {
    const dbUser = await getUserByClerkId(userId);
    role = dbUser?.role;
  }

  if (role !== "ADMIN") {
    redirect("/");
  }

  return <AppShellLayout>{children}</AppShellLayout>;
}

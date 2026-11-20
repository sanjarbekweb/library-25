import Link from "next/link";
import { Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { fetchAdminUsersApi } from "@/hooks/api/useUsers";
import { UserManagement } from "@/components/modules/admin/user-management";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "User & Role Management | libra25 Admin",
  description: "Manage system user accounts, promote assistants, demote roles, and adjust RBAC policies.",
};

interface AdminUsersPageProps {
  searchParams: Promise<{
    query?: string;
    role?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const resolvedParams = await searchParams;
  const { getToken } = await auth();
  const token = await getToken();

  const query = resolvedParams.query || "";
  const role = resolvedParams.role || "ALL";
  const status = resolvedParams.status || "ALL";
  const page = parseInt(resolvedParams.page || "1", 10);

  let users: any[] = [];
  let pagination = { total: 0, page: 1, limit: 20, totalPages: 1 };
  let stats = { totalCount: 0, studentCount: 0, assistantCount: 0, adminCount: 0, inactiveCount: 0 };

  try {
    const res = await fetchAdminUsersApi(
      {
        query,
        role,
        status,
        page,
        limit: 20,
      },
      token
    );
    users = res.users;
    pagination = res.pagination;
    stats = res.stats;
  } catch (error) {
    console.error("Failed to fetch admin users:", error);
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full w-9 h-9 border border-border hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer shadow-2xs"
              title="Back to Admin"
              aria-label="Back to Admin"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold font-display text-foreground">
            User Management
          </h1>
        </div>
      </div>

      {/* User Management Component */}
      <UserManagement
        initialUsers={users}
        pagination={pagination}
        stats={stats}
        currentSearch={query}
        currentRole={role}
        currentStatus={status}
      />
    </div>
  );
}

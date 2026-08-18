import Link from "next/link";
import { Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminUsers } from "@/lib/services/user-service";
import { UserManagement } from "@/components/modules/admin/user-management";

export const metadata = {
  title: "User & Role Management | ShelfSync Admin",
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

  const query = resolvedParams.query || "";
  const role = resolvedParams.role || "ALL";
  const status = resolvedParams.status || "ALL";
  const page = parseInt(resolvedParams.page || "1", 10);

  const { users, pagination, stats } = await getAdminUsers({
    query,
    role,
    status,
    page,
    limit: 20,
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Link href="/admin" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              <span>Admin Console</span>
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">User Management</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-foreground flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue border border-brand-blue/20 shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            User &amp; Role Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administrative console for account activation, role elevations (Assistant/Admin), and RBAC sync.
          </p>
        </div>

        <div>
          <Link href="/admin">
            <Button variant="outline" size="sm" className="rounded-full gap-2 text-xs font-semibold hover:bg-accent border-border">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              <span>Back to Admin Hub</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* User Management Component */}
      <UserManagement
        initialUsers={users as any}
        pagination={pagination}
        stats={stats}
        currentSearch={query}
        currentRole={role}
        currentStatus={status}
      />
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  ShieldCheck,
  UserCheck,
  ShieldAlert,
  UserX,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Shield,
  UserCog,
  Ban,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/providers/language-provider";
import { UserPresenceAvatar } from "@/components/animate-ui/components/community/user-presence-avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateUserRoleAction, toggleUserStatusAction } from "@/app/actions/user-actions";
import { toast } from "react-toastify";

export interface UserItem {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "STUDENT" | "ASSISTANT" | "ADMIN";
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count: {
    loans: number;
    reservations: number;
    assistedLoans: number;
  };
}

export interface UserStats {
  totalCount: number;
  studentCount: number;
  assistantCount: number;
  adminCount: number;
  inactiveCount: number;
}

export interface UserManagementProps {
  initialUsers: UserItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: UserStats;
  currentSearch: string;
  currentRole: string;
  currentStatus: string;
}

export function UserManagement({
  initialUsers,
  pagination,
  stats,
  currentSearch,
  currentRole,
  currentStatus,
}: UserManagementProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState(currentSearch);
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  // Role change modal state
  const [roleModalUser, setRoleModalUser] = useState<UserItem | null>(null);
  const [targetRole, setTargetRole] = useState<"STUDENT" | "ASSISTANT" | "ADMIN">("STUDENT");

  // Status modal state
  const [statusModalUser, setStatusModalUser] = useState<UserItem | null>(null);

  // Notification message
  const [actionAlert, setActionAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const applyFilters = (newParams: { query?: string; role?: string; status?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString());

    const q = newParams.query !== undefined ? newParams.query : searchQuery;
    const r = newParams.role !== undefined ? newParams.role : selectedRole;
    const s = newParams.status !== undefined ? newParams.status : selectedStatus;
    const p = newParams.page !== undefined ? newParams.page : 1;

    if (q) params.set("query", q);
    else params.delete("query");

    if (r && r !== "ALL") params.set("role", r);
    else params.delete("role");

    if (s && s !== "ALL") params.set("status", s);
    else params.delete("status");

    if (p > 1) params.set("page", p.toString());
    else params.delete("page");

    startTransition(() => {
      router.push(`/admin/users?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ page: 1 });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    applyFilters({ query: "", page: 1 });
  };

  const handleRoleFilter = (role: string) => {
    setSelectedRole(role);
    applyFilters({ role, page: 1 });
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    applyFilters({ status, page: 1 });
  };

  const openRoleModal = (user: UserItem, defaultRole?: "STUDENT" | "ASSISTANT" | "ADMIN") => {
    setRoleModalUser(user);
    setTargetRole(defaultRole || user.role);
  };

  const handleRoleUpdate = async () => {
    if (!roleModalUser) return;
    setActionAlert(null);

    const res = await updateUserRoleAction({
      targetUserId: roleModalUser.id,
      role: targetRole,
    });

    if (res.ok) {
      const msg = `Successfully updated ${roleModalUser.firstName} ${roleModalUser.lastName}'s role to ${targetRole}.`;
      setActionAlert({
        type: "success",
        message: msg,
      });
      toast.success(msg);
      setRoleModalUser(null);
      startTransition(() => {
        router.refresh();
      });
    } else {
      const errMsg = res.error?.message || "Failed to update user role.";
      setActionAlert({
        type: "error",
        message: errMsg,
      });
      toast.error(errMsg);
    }
  };

  const handleStatusToggle = async () => {
    if (!statusModalUser) return;
    setActionAlert(null);

    const newActiveState = !statusModalUser.isActive;
    const res = await toggleUserStatusAction({
      targetUserId: statusModalUser.id,
      isActive: newActiveState,
    });

    if (res.ok) {
      const msg = `Account for ${statusModalUser.firstName} ${statusModalUser.lastName} has been ${newActiveState ? "activated" : "deactivated"}.`;
      setActionAlert({
        type: "success",
        message: msg,
      });
      if (newActiveState) {
        toast.success(msg);
      } else {
        toast.info(msg);
      }
      setStatusModalUser(null);
      startTransition(() => {
        router.refresh();
      });
    } else {
      const errMsg = res.error?.message || "Failed to update account status.";
      setActionAlert({
        type: "error",
        message: errMsg,
      });
      toast.error(errMsg);
    }
  };

  const getRoleBadge = (role: "STUDENT" | "ASSISTANT" | "ADMIN") => {
    switch (role) {
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-blue/15 text-brand-blue border border-brand-blue/30">
            <ShieldAlert className="w-3 h-3 text-brand-blue" />
            <span>Admin</span>
          </span>
        );
      case "ASSISTANT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-blue/10 text-brand-blue border border-brand-blue/20 dark:text-blue-300">
            <ShieldCheck className="w-3 h-3" />
            <span>Assistant</span>
          </span>
        );
      case "STUDENT":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
            <UserCheck className="w-3 h-3" />
            <span>Student</span>
          </span>
        );
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-blue/10 text-brand-blue dark:text-blue-400 border border-brand-blue/20">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
          <span>Active</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
        <span>Deactivated</span>
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Alert Notification */}
      {actionAlert && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm ${
            actionAlert.type === "success"
              ? "bg-brand-blue/10 border-brand-blue/30 text-brand-blue dark:text-blue-400"
              : "bg-destructive/10 border-destructive/30 text-destructive"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionAlert.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-blue" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
            )}
            <span>{actionAlert.message}</span>
          </div>
          <button
            onClick={() => setActionAlert(null)}
            className="p-1 hover:opacity-70 rounded-full text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Registered</p>
              <p className="text-2xl font-extrabold font-mono mt-1 text-foreground">{stats.totalCount}</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center border border-brand-blue/20">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Students</p>
              <p className="text-2xl font-extrabold font-mono mt-1 text-foreground">{stats.studentCount}</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center border border-border">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Assistants</p>
              <p className="text-2xl font-extrabold font-mono mt-1 text-foreground">{stats.assistantCount}</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center border border-brand-blue/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Admins</p>
              <p className="text-2xl font-extrabold font-mono mt-1 text-foreground">
                {stats.adminCount}
              </p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-brand-blue/10 text-foreground flex items-center justify-center border border-brand-blue/20">
              <ShieldAlert className="h-5 w-5 text-brand-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-sm rounded-2xl col-span-2 lg:col-span-1 hover:border-foreground/20 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Deactivated</p>
              <p className="text-2xl font-extrabold font-mono mt-1 text-foreground">
                {stats.inactiveCount}
              </p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center border border-border">
              <UserX className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Campus Presence Widget */}
      <Card className="border border-border bg-card shadow-2xs rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-sm text-foreground">
              Live Patron Presence
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Online students &amp; circulation assistants active on the campus platform.
            </p>
          </div>
          <UserPresenceAvatar />
        </div>
      </Card>

      {/* Search & Filtering Bar */}
      <Card className="border border-border bg-card shadow-sm rounded-2xl p-4 hover:border-foreground/20 transition-all">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand-blue group-focus-within:scale-110 transition-all duration-200" />
            <Input
              type="text"
              placeholder="Search user by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 rounded-xl bg-background/80 border-border text-xs focus-visible:ring-4 focus-visible:ring-brand-blue/15 focus-visible:border-brand-blue h-10 transition-all duration-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:text-foreground text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* Role Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Role:</span>
            {["ALL", "STUDENT", "ASSISTANT", "ADMIN"].map((role) => (
              <Button
                key={role}
                variant={selectedRole === role ? "default" : "outline"}
                size="sm"
                onClick={() => handleRoleFilter(role)}
                className={`rounded-full text-xs h-8 px-3 ${selectedRole === role
                    ? "bg-brand-blue text-white hover:bg-brand-blue/90"
                    : "border-border text-muted-foreground hover:text-foreground"
                  }`}
              >
                {role === "ALL" ? "All Roles" : role.charAt(0) + role.slice(1).toLowerCase()}
              </Button>
            ))}
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Status:</span>
            {["ALL", "ACTIVE", "INACTIVE"].map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilter(status)}
                className={`rounded-full text-xs h-8 px-3 ${selectedStatus === status
                    ? "bg-brand-blue text-white hover:bg-brand-blue/90"
                    : "border-border text-muted-foreground hover:text-foreground"
                  }`}
              >
                {status === "ALL" ? "All Status" : status === "ACTIVE" ? "Active" : "Deactivated"}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* User Directory Table */}
      <Card className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden hover:border-foreground/20 transition-all">
        {initialUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-display font-bold text-base text-foreground">No accounts found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No user accounts matched your current search query or filter selection. Try resetting filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                <tr>
                  <th className="p-4 pl-6">User / Account</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 hidden md:table-cell">Loans &amp; Holds</th>
                  <th className="p-4 hidden lg:table-cell">Joined Date</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {initialUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-accent/40 transition-colors">
                    {/* User Info */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-brand-blue/10 text-brand-blue font-bold flex items-center justify-center border border-brand-blue/20 shrink-0 uppercase text-xs">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-muted-foreground truncate text-[11px] font-mono">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-4">{getRoleBadge(user.role)}</td>

                    {/* Status */}
                    <td className="p-4">{getStatusBadge(user.isActive)}</td>

                    {/* Telemetry Stats */}
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
                        <span title="Active / Past Loans">Loans: {user._count.loans}</span>
                        <span>•</span>
                        <span title="Reservations">Holds: {user._count.reservations}</span>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="p-4 hidden lg:table-cell text-muted-foreground font-mono text-[11px]">
                      {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </td>

                    {/* Action Dropdown */}
                    <td className="p-4 pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="rounded-full hover:bg-accent">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl border border-border">
                          <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground">
                            Role Permissions
                          </DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openRoleModal(user, "ASSISTANT")}>
                            <ShieldCheck className="h-4 w-4 mr-2 text-brand-blue" />
                            <span>Set as Assistant</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openRoleModal(user, "ADMIN")}>
                            <ShieldAlert className="h-4 w-4 mr-2 text-amber-500" />
                            <span>Elevate to Admin</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openRoleModal(user, "STUDENT")}>
                            <UserCheck className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Set as Student</span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground">
                            Account Access
                          </DropdownMenuLabel>
                          {user.isActive ? (
                            <DropdownMenuItem
                              onClick={() => setStatusModalUser(user)}
                              className="text-rose-600 dark:text-rose-400 focus:text-rose-600"
                            >
                              <Ban className="h-4 w-4 mr-2 text-rose-500" />
                              <span>Deactivate User</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => setStatusModalUser(user)}>
                              <UserCheck className="h-4 w-4 mr-2 text-emerald-500" />
                              <span>Reactivate User</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <div>
              Showing page <span className="font-semibold text-foreground">{pagination.page}</span> of{" "}
              <span className="font-semibold text-foreground">{pagination.totalPages}</span> ({pagination.total} total)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1 || isPending}
                onClick={() => applyFilters({ page: pagination.page - 1 })}
                className="rounded-full h-8 px-3 text-xs gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages || isPending}
                onClick={() => applyFilters({ page: pagination.page + 1 })}
                className="rounded-full h-8 px-3 text-xs gap-1"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Role Management Modal */}
      <Dialog open={!!roleModalUser} onOpenChange={(open) => !open && setRoleModalUser(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 border-border">
          <DialogHeader className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
              <UserCog className="h-5 w-5" />
            </div>
            <DialogTitle className="font-display font-bold text-lg text-foreground">
              Modify User Role Permissions
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Update role assignment for{" "}
              <strong className="text-foreground">
                {roleModalUser?.firstName} {roleModalUser?.lastName}
              </strong>{" "}
              ({roleModalUser?.email}). This change will sync instantly to PostgreSQL and Clerk public metadata.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <label className="text-xs font-semibold text-foreground">Select New Role Target:</label>

            <div className="space-y-2">
              {[
                {
                  role: "STUDENT",
                  title: "Student (Default)",
                  desc: "Can search catalog, place copy hold reservations, and view loan history.",
                  icon: UserCheck,
                },
                {
                  role: "ASSISTANT",
                  title: "Library Assistant",
                  desc: "Authorized to manage circulation desk, conduct checkouts/check-ins, and inspect audit logs.",
                  icon: ShieldCheck,
                },
                {
                  role: "ADMIN",
                  title: "Administrator",
                  desc: "Full administrative access including review moderation, RBAC permissions, and system analytics.",
                  icon: ShieldAlert,
                },
              ].map((item) => (
                <div
                  key={item.role}
                  onClick={() => setTargetRole(item.role as any)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${targetRole === item.role
                      ? "border-brand-blue bg-brand-blue/5 dark:bg-brand-blue/10"
                      : "border-border hover:border-brand-blue/40"
                    }`}
                >
                  <div className="p-2 rounded-xl bg-background border border-border text-foreground shrink-0 mt-0.5">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-xs text-foreground">{item.title}</p>
                      {targetRole === item.role && <Check className="h-4 w-4 text-brand-blue" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setRoleModalUser(null)}
              className="rounded-full text-xs"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRoleUpdate}
              disabled={isPending || targetRole === roleModalUser?.role}
              className="rounded-full bg-brand-blue text-white hover:bg-brand-blue/90 font-semibold text-xs"
            >
              {isPending ? "Updating Role..." : "Confirm Role Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Deactivation/Reactivation Modal */}
      <Dialog open={!!statusModalUser} onOpenChange={(open) => !open && setStatusModalUser(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 border-border">
          <DialogHeader className="space-y-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${statusModalUser?.isActive
                  ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                }`}
            >
              {statusModalUser?.isActive ? <Ban className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
            </div>
            <DialogTitle className="font-display font-bold text-lg text-foreground">
              {statusModalUser?.isActive ? "Deactivate User Account" : "Reactivate User Account"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to {statusModalUser?.isActive ? "deactivate" : "reactivate"} the account for{" "}
              <strong className="text-foreground">
                {statusModalUser?.firstName} {statusModalUser?.lastName}
              </strong>{" "}
              ({statusModalUser?.email})?
            </DialogDescription>
          </DialogHeader>

          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground leading-relaxed">
            {statusModalUser?.isActive ? (
              <p>
                Deactivating an account prevents the user from placing holds, accessing desk privileges, or modifying library data. Active loans or history records will be preserved.
              </p>
            ) : (
              <p>Reactivating will restore account access and permit catalog interactions based on their assigned role.</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setStatusModalUser(null)}
              className="rounded-full text-xs"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusToggle}
              disabled={isPending}
              className={`rounded-full font-semibold text-xs ${statusModalUser?.isActive
                  ? "bg-rose-600 text-white hover:bg-rose-700"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
            >
              {isPending
                ? "Processing..."
                : statusModalUser?.isActive
                  ? "Deactivate Account"
                  : "Reactivate Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

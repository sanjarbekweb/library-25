import { UserSkeleton } from "@/components/modules/admin/user-skeleton";

export default function AdminUsersLoading() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <UserSkeleton />
    </div>
  );
}

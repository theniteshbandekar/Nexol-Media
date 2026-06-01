import { UsersTable } from "@/components/admin/users-table";
import { adminListUsers } from "@/lib/firebase/admin-content";
import { requireAdminPage } from "@/lib/firebase/auth";

export default async function AdminUsersPage() {
  await requireAdminPage();
  const users = await adminListUsers();
  return <UsersTable users={users} />;
}

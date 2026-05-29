import { UsersTable } from "@/components/admin/users-table";
import { adminListUsers } from "@/lib/firebase/admin-content";

export default async function AdminUsersPage() {
  const users = await adminListUsers();
  return <UsersTable users={users} />;
}

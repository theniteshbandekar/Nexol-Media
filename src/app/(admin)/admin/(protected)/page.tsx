import { getCurrentUser } from "@/lib/firebase/auth";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  return (
    <div className="admin-page">
      <h1>Dashboard</h1>
      <p>
        Signed in as <strong>{user?.email}</strong> ({user?.role}).
      </p>
      <p className="admin-muted">
        Editors arrive next: settings &amp; navigation, home page, blog,
        case studies, services, and media.
      </p>
    </div>
  );
}

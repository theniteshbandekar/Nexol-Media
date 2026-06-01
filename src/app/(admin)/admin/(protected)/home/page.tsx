import { getHomePage } from "@/lib/sanity/home-page";
import { HomeEditor } from "@/components/admin/editors/home-editor";
import { requireAdminPage } from "@/lib/firebase/auth";

export default async function AdminHomePage() {
  await requireAdminPage();
  const home = await getHomePage();
  return <HomeEditor initial={home} />;
}

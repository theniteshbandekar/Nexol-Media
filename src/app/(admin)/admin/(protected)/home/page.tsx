import { getHomePage } from "@/lib/sanity/home-page";
import { HomeEditor } from "@/components/admin/editors/home-editor";

export default async function AdminHomePage() {
  const home = await getHomePage();
  return <HomeEditor initial={home} />;
}

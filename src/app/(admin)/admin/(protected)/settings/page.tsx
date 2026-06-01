import { getSiteSettings } from "@/lib/sanity/site-settings";
import { SettingsEditor } from "@/components/admin/editors/settings-editor";
import { requireAdminPage } from "@/lib/firebase/auth";

export default async function AdminSettingsPage() {
  await requireAdminPage();
  const settings = await getSiteSettings();
  return <SettingsEditor initial={settings} />;
}

import { getSiteSettings } from "@/lib/sanity/site-settings";
import { SettingsEditor } from "@/components/admin/editors/settings-editor";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return <SettingsEditor initial={settings} />;
}

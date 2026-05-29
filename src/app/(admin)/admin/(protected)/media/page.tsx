import { MediaBrowser } from "@/components/admin/media-browser";
import { listImages } from "@/lib/firebase/storage";

export default async function AdminMediaPage() {
  const items = await listImages();
  return <MediaBrowser items={items} />;
}

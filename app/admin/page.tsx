import AdminUI from "@/components/AdminUI";
import { readJsonData } from "@/lib/fetchJsonData";

export default function AdminPage() {
  const { artwork, siteInfo } = readJsonData();

  return <AdminUI artwork={artwork} siteInfo={siteInfo} />;
}

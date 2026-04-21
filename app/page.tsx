import GalleryUI from "@/components/GalleryUI";
import { readJsonData } from "@/lib/fetchJsonData";

export default function GalleryPage() {
  const { artwork, siteInfo } = readJsonData();

  return <GalleryUI artwork={artwork} siteInfo={siteInfo} />;
}

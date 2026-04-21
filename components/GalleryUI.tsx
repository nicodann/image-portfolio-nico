import { Artwork, SiteInfo } from "@/types/types";
import MasonryGrid from "./MasonryGrid";
import SiteHeader from "./SiteHeader";

export default function GalleryUI({
  artwork,
  siteInfo,
}: {
  artwork: Artwork[];
  siteInfo: SiteInfo;
}) {
  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <SiteHeader>
        <h1>{siteInfo.title}</h1>
      </SiteHeader>
      <MasonryGrid artwork={artwork} />
    </main>
  );
}

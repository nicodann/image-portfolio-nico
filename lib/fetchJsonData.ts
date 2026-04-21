import { Artwork, SiteInfo } from "@/types/types";
import { readFileSync } from "fs";
import { join } from "path";

export const readJsonData = () => {
  const rawArtwork = readFileSync(
    join(process.cwd(), "content", "artwork.json"),
    "utf-8",
  );
  const artwork: Artwork[] = JSON.parse(rawArtwork);

  const rawSiteInfo = readFileSync(
    join(process.cwd(), "content", "site-info.json"),
    "utf-8",
  );
  const siteInfo: SiteInfo = JSON.parse(rawSiteInfo);

  return { artwork, siteInfo };
};

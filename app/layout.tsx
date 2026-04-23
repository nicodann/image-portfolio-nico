import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { readJsonData } from "@/lib/fetchJsonData";

const { siteInfo } = readJsonData();

export const metadata: Metadata = {
  title: siteInfo.title,
  description: "Artist portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100 antialiased">
        {children}
        <Script
          src="https://identity.netlify.com/v1/netlify-identity-widget.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

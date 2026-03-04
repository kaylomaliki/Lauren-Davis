import type { Metadata } from "next";
import { getGlobalSettings } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const globalSettings = await getGlobalSettings();
  
  return buildMetadata({
    siteTitle: globalSettings?.siteTitle,
    siteDescription: globalSettings?.siteDescription,
    defaultOgImage: globalSettings?.defaultOgImage,
  });
}

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}


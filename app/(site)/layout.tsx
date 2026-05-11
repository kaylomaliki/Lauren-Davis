import type { Metadata } from "next";
import { getGlobalSettings } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import Nav from "@/components/Nav";
import SiteIntroLoader from "@/components/SiteIntroLoader";
import { GallerySelectionProvider } from "@/contexts/GallerySelectionContext";
import { ActiveSlideProvider } from "@/contexts/ActiveSlideContext";
import { WorkFilterProvider } from "@/contexts/WorkFilterContext";

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
  return (
    <GallerySelectionProvider>
      <ActiveSlideProvider>
        <WorkFilterProvider>
          <Nav />
          {children}
          <SiteIntroLoader />
        </WorkFilterProvider>
      </ActiveSlideProvider>
    </GallerySelectionProvider>
  );
}


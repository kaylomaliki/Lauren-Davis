import { getGlobalSettings, getPageBySlug } from "@/lib/queries";
import PortableText from "@/components/sanity/PortableText";

/**
 * Homepage
 * 
 * This page fetches content from Sanity CMS.
 * 
 * To customize:
 * 1. Create a "homepage" document in Sanity Studio with slug "home"
 * 2. Or modify this component to fetch different content
 * 
 * ISR (Incremental Static Regeneration):
 * - Revalidates every 60 seconds
 * - Pages are statically generated at build time
 * - Updates automatically when content changes in Sanity
 */
export const revalidate = 60;

export default async function Home() {
  const globalSettings = await getGlobalSettings();
  const page = await getPageBySlug("home");

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">
        {page?.title || globalSettings?.siteTitle || "Welcome"}
      </h1>
      {page?.description && (
        <p className="mt-4 text-lg text-gray-600">{page.description}</p>
      )}
      {globalSettings?.siteDescription && !page?.description && (
        <p className="mt-4 text-lg text-gray-600">{globalSettings.siteDescription}</p>
      )}
      
      {/* Render portable text content from Sanity */}
      {page?.content && Array.isArray(page.content) && page.content.length > 0 && (
        <div className="mt-8 prose prose-lg max-w-none">
          <PortableText content={page.content} />
        </div>
      )}
    </main>
  );
}


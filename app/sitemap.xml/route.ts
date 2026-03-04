import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity.client";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  try {
    // Fetch all pages with slugs
    const pages = await sanityClient.fetch<Array<{ slug?: { current: string } }>>(
      `*[_type in ["homepage", "page", "post"] && defined(slug.current)]{
        "slug": slug.current
      }`
    );

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${pages
  .map((page) => {
    if (!page.slug) return "";
    return `  <url>
    <loc>${baseUrl}/${page.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch {
    // Fallback sitemap if query fails
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new NextResponse(fallbackSitemap, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  }
}


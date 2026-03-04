import { NextResponse } from "next/server";

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /
Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"}/sitemap.xml
`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}


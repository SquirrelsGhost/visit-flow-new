import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin-dashboard", "/security-dashboard"],
      },
    ],
    sitemap: [
      "https://visit-flow.com/sitemap.xml",
      "https://visit-flow.com/sitemap-blog.xml",
    ],
  };
}

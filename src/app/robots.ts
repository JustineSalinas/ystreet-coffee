import type { MetadataRoute } from "next";

// This preview isn't approved by the business owners yet — keep it out of
// search engines entirely until it's live for real. Remove once launched.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}

import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL || "https://travelnepal.app";

  const routes = [
    "",
    "/destinations",
    "/hotels",
    "/restaurants",
    "/guides",
    "/ai-planner",
    "/transit",
    "/emergency",
    "/partner/business-type",
    "/login",
    "/register",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  return routes;
}

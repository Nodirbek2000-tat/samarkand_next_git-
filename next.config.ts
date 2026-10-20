import type { NextConfig } from "next";

const DJANGO_URL = process.env.DJANGO_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  // self-contained server for the Docker image (.next/standalone/server.js)
  output: "standalone",
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  // Django owns its URL scheme; never redirect /api/... between slash variants.
  skipTrailingSlashRedirect: true,
  images: {
    localPatterns: [{ pathname: "/media/**" }, { pathname: "/images/**" }],
    formats: ["image/avif", "image/webp"],
    // nothing wider than 1920 px: a phone's "180svh × DPR 3" otherwise pulled the 3840 px candidate
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920],
    // optimized copies are kept a month (uploads get new file names, so they never go stale)
    minimumCacheTTL: 2592000,
  },
  // Pictures in public/ are served with max-age=0 by default: every visit asked the server about each of
  // them again. A week fresh, then shown from cache while it re-checks in the background. When a picture
  // changes, give the file a new name (day-v2.webp → day-v3.webp) so visitors get it at once.
  async headers() {
    const week = "public, max-age=604800, stale-while-revalidate=2592000";
    return [
      ...["/images/:path*", "/textures/:path*"].map((source) => ({ source, headers: [{ key: "Cache-Control", value: week }] })),
      // (pages are not streamed through nginx on purpose: it keeps each one for 10 s and hands that copy to
      // everyone — nginx/user_conf.d/mentadbirkor.conf — which carries far more visitors than streaming)
    ];
  },
  // Old site URLs keep working (bookmarks, search engines).
  async redirects() {
    return [
      { source: "/council/board", destination: "/council/management", permanent: true },
      { source: "/council/board/:slug", destination: "/council/management/:slug", permanent: true },
      { source: "/council/member/:slug", destination: "/council/members/:slug", permanent: true },
      { source: "/about/council", destination: "/council", permanent: true },
      { source: "/council/forum", destination: "/business-environment/forum", permanent: true },
      { source: "/council/forum/:year", destination: "/business-environment/forum/:year", permanent: true },
      { source: "/council/clubs", destination: "/projects/clubs", permanent: true },
      { source: "/council/clubs/hr", destination: "/projects/hr-club", permanent: true },
      { source: "/council/clubs/accountants", destination: "/projects/accountants-club", permanent: true },
      { source: "/council/projects", destination: "/projects", permanent: true },
      { source: "/council/projects/:slug", destination: "/projects/:slug", permanent: true },
      { source: "/council/media", destination: "/business-environment/media", permanent: true },
      { source: "/projects/clubs/hr", destination: "/projects/hr-club", permanent: true },
      { source: "/projects/clubs/accountants", destination: "/projects/accountants-club", permanent: true },
      { source: "/business-environment", destination: "/business-environment/forum", permanent: true },
      { source: "/business-environment/projects", destination: "/projects", permanent: true },
      { source: "/business-environment/clubs", destination: "/projects/clubs", permanent: true },
      { source: "/business-environment/clubs/hr", destination: "/projects/hr-club", permanent: true },
      { source: "/business-environment/clubs/accountants", destination: "/projects/accountants-club", permanent: true },
      { source: "/cooperation/domestic", destination: "/cooperation#mahalliy", permanent: true },
      { source: "/cooperation/international", destination: "/cooperation#xalqaro", permanent: true },
      { source: "/feedback", destination: "/feedback/appeals", permanent: true },
      { source: "/contacts", destination: "/feedback/contacts", permanent: true },
      { source: "/events", destination: "/announcements", permanent: true },
      { source: "/events/:slug", destination: "/announcements/:slug", permanent: true },
      { source: "/admin/dashboard", destination: "/admin", permanent: false },
    ];
  },
  // The browser only ever talks to this origin: API calls and uploaded files are proxied to Django,
  // so session cookies and CSRF protection work without any CORS setup.
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${DJANGO_URL}/api/:path*` },
      { source: "/media/:path*", destination: `${DJANGO_URL}/media/:path*` },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

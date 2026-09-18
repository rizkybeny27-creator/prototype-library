import type { NextConfig } from "next";

const commonHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const appCsp =
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
  "style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; " +
  "font-src 'self' data:; connect-src 'self'; frame-src 'self'; " +
  "frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self'";

const prototypeCsp = "sandbox allow-scripts; frame-ancestors 'self'";

const cspHeader: Array<{ key: string; value: string }> = [
  { key: "Content-Security-Policy", value: appCsp },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      // Admin & tester pages: full React hydration requires inline/eval in dev.
      { source: "/", headers: [...commonHeaders, ...cspHeader] },
      { source: "/login", headers: [...commonHeaders, ...cspHeader] },
      { source: "/projects/:path*", headers: [...commonHeaders, ...cspHeader] },
      { source: "/t/:slug", headers: [...commonHeaders, ...cspHeader] },
      // Served prototype HTML: sandboxed so it can never reach this origin.
      // (Only this CSP applies — a second, looser CSP would break inline scripts.)
      {
        source: "/r/:slug/:label",
        headers: [
          ...commonHeaders,
          { key: "Content-Security-Policy", value: prototypeCsp },
        ],
      },
      { source: "/api/:path*", headers: commonHeaders },
    ];
  },
};

export default nextConfig;
import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Playwright (used only by the local-only /api/admin/scrape/g2g route and
  // the scripts/ CLI tools) ships large native binaries that must never be
  // traced/bundled into a deployed serverless function — that route is
  // guarded at runtime (see its own file) to refuse to run on Vercel at all,
  // but this keeps the build from even trying to bundle Playwright's
  // internals into that function in the first place.
  serverExternalPackages: ['playwright'],
};

export default nextConfig;

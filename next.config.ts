import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app lives in a subfolder of the cheap-staff repo, which has its own
  // root-level package-lock.json (the Telegram bot) — pin the workspace root
  // to this folder so Turbopack doesn't have to guess between the two.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
